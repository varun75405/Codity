# Design Decisions

## 1. Concurrency Model: SKIP LOCKED
We use PostgreSQL's `SELECT ... FOR UPDATE SKIP LOCKED` for atomic job claiming. 
**Why?** This prevents multiple workers from claiming the same job without requiring a separate queuing infrastructure like Redis or RabbitMQ, keeping our stack simpler (just Postgres).

## 2. Indexes and Performance
To make `SKIP LOCKED` fast, we rely on a composite index on the `jobs` table: `(status, run_at, priority)`. This allows Postgres to immediately locate the highest-priority, ready-to-run jobs without scanning the whole table.

## 3. Queue Statistics
We do not store explicit statistics counters on the `queues` table.
**Why?** Maintaining accurate counters in a highly concurrent environment leads to contention and deadlocks on the queue row. Instead, we calculate statistics on-the-fly using `COUNT(*)` queries with appropriate indexing, which is fast enough for dashboard views.

## 4. Retry History
Every execution attempt generates a new `job_executions` record.
**Why?** This provides a full audit trail of a job's lifecycle, including exactly when it failed, why it failed (error reason), and which worker attempted it.

## 5. Dead-worker Recovery
Workers emit a heartbeat every 15 seconds. A background task sweeps for workers with a `last_seen` timestamp older than 60 seconds, marks them as `Offline`, and re-queues their running jobs.
