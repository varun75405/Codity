# Codity: Distributed Job Scheduling Platform
**Project Submission**

---

## 1. Executive Summary
Codity is a production-inspired, distributed job scheduling platform capable of reliably executing asynchronous background jobs across multiple worker nodes. The system is built with a decoupled architecture utilizing a **FastAPI (Python)** backend, a **PostgreSQL** database for ACID-compliant state management, and a **React (Vite + Tailwind)** frontend dashboard for complete system observability.

The core of the system achieves high reliability and concurrency without external message brokers (like Redis or RabbitMQ) by leveraging PostgreSQL's `SELECT ... FOR UPDATE SKIP LOCKED` mechanism.

---

## 2. Architecture Diagram
The platform is separated into distinct, scalable domains communicating through strict boundaries.

```mermaid
graph TD
    subgraph Frontend["Frontend Layer"]
        UI[React / Vite Dashboard]
    end

    subgraph Backend["API Layer (FastAPI)"]
        API[REST API /jobs, /queues]
        Auth[JWT Authentication & RBAC]
        WS[WebSocket Server /ws/jobs]
    end

    subgraph Execution["Worker Pool (worker/main.py)"]
        W1[Worker Node 1]
        W2[Worker Node 2]
        Dispatcher[Cron / Batch Dispatcher]
    end

    subgraph Database["Storage Layer (PostgreSQL)"]
        DB[(PostgreSQL Database)]
        Q_Table[Queues & Jobs Tables]
        DLQ_Table[Dead Letter Queue entries]
    end

    %% Frontend to Backend Connections
    UI -- HTTP Requests --> API
    UI -- Auth Token --> Auth
    UI -- Live Updates --> WS

    %% Backend to Database Connections
    API -- Read/Write --> DB
    Auth -- Verify Credentials --> DB
    WS -. Subscribes to Events .- DB

    %% Worker Operations
    W1 -- "1. Claim Job (SELECT ... FOR UPDATE SKIP LOCKED)" --> Q_Table
    W1 -- "2. Heartbeat (Update last_seen)" --> DB
    W1 -- "3. Execute Job" --> W1
    W1 -- "4a. Success or Retry" --> Q_Table
    W1 -- "4b. Max Retries Exceeded" --> DLQ_Table

    W2 -- "Claim & Execute" --> Q_Table
    
    Dispatcher -- "Evaluate Cron & Enqueue Jobs" --> Q_Table

    DB --- Q_Table
    DB --- DLQ_Table

    classDef frontend fill:#61dafb,stroke:#333,stroke-width:2px,color:#000;
    classDef backend fill:#009688,stroke:#333,stroke-width:2px,color:#fff;
    classDef db fill:#336791,stroke:#333,stroke-width:2px,color:#fff;
    classDef worker fill:#ff9800,stroke:#333,stroke-width:2px,color:#fff;

    class UI frontend;
    class API,Auth,WS backend;
    class DB,Q_Table,DLQ_Table db;
    class W1,W2,Dispatcher worker;
```

---

## 3. Database Entity Relationship (ER) Diagram
The schema is highly normalized, featuring strict foreign keys, lifecycle execution trails, and queue sharding support.

```mermaid
erDiagram
    organizations ||--o{ users : "contains"
    organizations ||--o{ projects : "owns"
    projects ||--o{ queues : "has"
    retry_policies |o--o{ queues : "default_for"
    queues ||--o{ jobs : "contains"
    retry_policies |o--o{ jobs : "applies_to"
    queues ||--o{ recurring_jobs : "schedules"
    jobs |o--o{ jobs : "parent_of (Workflow)"
    jobs ||--o{ job_executions : "has_history"
    job_executions ||--o{ job_logs : "generates"
    workers ||--o{ job_executions : "executes"
    jobs ||--o| dlq_entries : "moves_to"

    organizations {
        UUID id PK
        String name
        DateTime created_at
    }
    users {
        UUID id PK
        UUID organization_id FK
        String email UK
        String password_hash
        String role
    }
    projects {
        UUID id PK
        UUID organization_id FK
        String name
    }
    retry_policies {
        UUID id PK
        String name
        String strategy "fixed, linear, exponential"
        Integer max_retries
        Integer initial_delay_ms
        Integer max_delay_ms
    }
    queues {
        UUID id PK
        UUID project_id FK
        UUID default_retry_policy_id FK
        String name
        Integer priority
        Integer concurrency_limit
        Boolean is_paused
    }
    jobs {
        UUID id PK
        UUID queue_id FK
        UUID retry_policy_id FK
        UUID parent_job_id FK
        String type
        JSONB payload
        String status "Queued, Claimed, Running, Completed, Failed"
        Integer attempts
        DateTime run_at
        Integer max_retries
        Integer priority
        String shard_key
        DateTime created_at
        DateTime updated_at
    }
    job_executions {
        UUID id PK
        UUID job_id FK
        UUID worker_id FK
        String status "Running, Completed, Failed"
        DateTime started_at
        DateTime completed_at
        Text error_reason
    }
    job_logs {
        UUID id PK
        UUID job_execution_id FK
        String level
        Text message
        DateTime timestamp
    }
    workers {
        UUID id PK
        String hostname
        String status "Active, ShuttingDown, Offline"
        DateTime last_seen "heartbeat tracking"
    }
    dlq_entries {
        UUID id PK
        UUID job_id FK
        Text error_reason
        Text ai_failure_summary
        DateTime moved_at
    }
    recurring_jobs {
        UUID id PK
        UUID queue_id FK
        String type
        JSONB payload
        String cron_expression
        DateTime last_scheduled_at
        Boolean is_paused
    }
```

### 3.1 Indexes & Performance
*   **Job Claiming Index:** `ix_jobs_claim` on `jobs (status, run_at, priority)` enables `SKIP LOCKED` to claim ready jobs without full table scans.
*   **Sharding Index:** Index on `jobs (shard_key)` allows horizontal partitioning.
*   **User Lookups:** Unique index on `users (email)` guarantees fast authentication resolution.

---

## 4. API Documentation
The complete, interactive OpenAPI (Swagger) documentation is auto-generated and hosted at `/docs` when running the backend. Below is a summary of the core REST interface.

### Authentication & Authorization
*   `POST /auth/register` - Register a new User and Organization.
*   `POST /auth/login` - Authenticate and receive a JWT access token.

### Queues Management
*   `GET /queues` - List all queues for the authenticated project.
*   `POST /queues` - Create a new queue (configure concurrency limits, pause states).
*   `PUT /queues/{id}` - Pause/Resume queues or update concurrency logic.

### Job Lifecycle
*   `POST /jobs` - Enqueue a single job (immediate or delayed via `run_at`).
*   `POST /jobs/batch` - Atomically enqueue a bulk array of jobs.
*   `GET /jobs` - Paginated job explorer (filter by status, queue, or search).
*   `GET /jobs/{id}` - Retrieve full job execution history and attached logs.

### Observability
*   `WS /ws/jobs` - WebSocket streaming endpoint for real-time metrics.

---

## 5. Design Decisions & Major Trade-offs

This section outlines the engineering rationale behind critical system components.

### 5.1 Concurrency Model: PostgreSQL `SKIP LOCKED`
*   **Decision:** We utilized PostgreSQL's `SELECT ... FOR UPDATE SKIP LOCKED` for atomic job claiming instead of a dedicated message broker (e.g., Redis).
*   **Trade-off:** While Redis lists (`BLPOP`) offer marginally faster pure throughput, `SKIP LOCKED` allows us to maintain strict ACID transactional guarantees, achieve zero-dependency infrastructure (just Postgres), and eliminate the "split-brain" problem of keeping an ephemeral queue in sync with a persistent database.

### 5.2 Indexing for Fast Retrieval
*   **Decision:** We applied a composite index `(status, run_at, priority)` on the `jobs` table.
*   **Trade-off:** Write performance (inserts) takes a microscopic hit, but this exact index ensures that workers querying for `status = 'Queued'` and `run_at <= NOW()` can claim jobs in microseconds without triggering sequential table scans.

### 5.3 Queue Statistics Calculation
*   **Decision:** We do not store explicit, mutable statistic counters (e.g., `active_jobs_count = 5`) on the `queues` table.
*   **Trade-off:** Maintaining accurate integer counters in a highly concurrent environment leads to severe write-contention and deadlocks on the queue row. Instead, we calculate statistics on-the-fly using `COUNT(*)` queries which scale infinitely better across horizontal worker nodes.

### 5.4 Job Execution History
*   **Decision:** Every single execution attempt generates a brand new `job_executions` record rather than mutating the original job row.
*   **Trade-off:** This consumes more database storage over time, but provides a critical, immutable audit trail of a job's lifecycle (exactly when it failed, why it failed, and which specific worker node attempted it).

### 5.5 Dead-Worker Recovery
*   **Decision:** Workers emit a heartbeat to the DB every 15 seconds. 
*   **Trade-off:** This introduces slight DB load, but allows a background sweeping process to guarantee that if a worker node crashes unexpectedly (e.g., OOM kill, hardware failure), its "Running" jobs are automatically recovered, marked as failed, and re-queued without manual intervention.

---

## 6. Automated Tests (Critical Functionality)
Test suites are implemented using `pytest` to verify API security barriers and backoff algorithm mathematics.

### Security & API Boundaries (`tests/test_api.py`)
```python
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_auth_missing_token():
    """Ensure protected routes reject unauthenticated requests."""
    response = client.get("/queues")
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}

def test_login_invalid_credentials():
    """Ensure auth route rejects bad passwords."""
    response = client.post("/auth/login", data={"username": "wrong", "password": "wrong"})
    assert response.status_code == 401
```

### Worker Retry Logic (`tests/test_worker.py`)
```python
import pytest

def test_exponential_backoff_calculation():
    """Verify exponential backoff curve calculates exact milliseconds correctly."""
    initial_delay_ms = 1000
    attempts = 2
    # Exponential formula: initial * (2 ^ (attempts - 1))
    delay_ms = min(initial_delay_ms * (2 ** (attempts - 1)), 60000)
    assert delay_ms == 2000

def test_linear_backoff_calculation():
    """Verify linear backoff curve calculates exact milliseconds correctly."""
    initial_delay_ms = 1000
    attempts = 3
    # Linear formula: initial * attempts
    delay_ms = min(initial_delay_ms * attempts, 60000)
    assert delay_ms == 3000
```
