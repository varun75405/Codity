# Distributed Job Scheduler Architecture

```mermaid
graph TD
    subgraph Frontend
        A[Next.js / Vite SPA] -->|REST API + JWT| B(FastAPI Server)
    end
    
    subgraph Backend API
        B --> |CRUD, Enqueue| C[(PostgreSQL)]
    end
    
    subgraph Worker Pool
        W1[Worker Node 1] --> |SKIP LOCKED| C
        W2[Worker Node 2] --> |SKIP LOCKED| C
        W3[Worker Node n] --> |SKIP LOCKED| C
    end
    
    subgraph Dispatcher
        D[Cron Dispatcher] --> |Evaluate crons| C
    end

    C --> |Retry History| E[Job Executions]
    C --> |Failures| F[DLQ]
```

## Setup Instructions

1. **Start the database**: `docker compose up -d`
2. **Start the API**: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
3. **Start the Worker**: `cd worker && python main.py`
4. **Start the Dispatcher**: `cd worker && python dispatcher.py`
5. **Start the Frontend**: `cd frontend && npm install && npm run dev`
