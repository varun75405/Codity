from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, queues, jobs
from .core.database import engine
from .models import models
from typing import List

# Bonus: Simple In-Memory Rate Limiting
import time
RATE_LIMIT = 100 # requests
RATE_WINDOW = 60 # seconds
clients = {}

def rate_limit_dependency(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    if client_ip not in clients:
        clients[client_ip] = []
    
    # filter out old requests
    clients[client_ip] = [t for t in clients[client_ip] if now - t < RATE_WINDOW]
    
    if len(clients[client_ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too Many Requests")
    
    clients[client_ip].append(now)
    return True

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Codity Job Scheduler",
    description="A distributed, highly reliable job scheduling platform.",
    version="1.0.0",
    dependencies=[Depends(rate_limit_dependency)] # Apply globally for demonstration
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(queues.router, prefix="/queues", tags=["Queues"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])

# Bonus: WebSocket Live Updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/jobs")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, listen for client messages
            data = await websocket.receive_text()
            await manager.broadcast(f"Client says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Job Scheduler API"}
