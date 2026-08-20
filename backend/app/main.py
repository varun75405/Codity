from fastapi import FastAPI
from .api import auth, queues, jobs

app = FastAPI(title="Distributed Job Scheduler API")

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(queues.router, prefix="/queues", tags=["Queues"])
app.include_router(jobs.router, prefix="/queues", tags=["Jobs"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Job Scheduler API"}
