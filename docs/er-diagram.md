# Entity Relationship (ER) Diagram

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

### Indexes & Performance
*   **Job Claiming Index:** `ix_jobs_claim` on `jobs (status, run_at, priority)` enables `SKIP LOCKED` to claim ready jobs without full table scans.
*   **Sharding Index:** Index on `jobs (shard_key)` allows horizontal partitioning.
*   **User Lookups:** Unique index on `users (email)` guarantees fast authentication resolution.
