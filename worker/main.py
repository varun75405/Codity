import asyncio
import os
import sys
import signal
import socket
import logging
from datetime import datetime, timedelta
from uuid import uuid4

# Setup paths to import backend models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.models.models import Job, JobExecution, JobLog, Worker, RetryPolicy, Queue, DLQEntry

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(name)s: %(message)s')
logger = logging.getLogger("worker")

_db_url = os.environ.get("DATABASE_URL", "postgresql://user:password@localhost:5432/job_scheduler")
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

DATABASE_URL = _db_url
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

WORKER_ID = uuid4()
HOSTNAME = socket.gethostname()

class WorkerService:
    def __init__(self):
        self.is_running = True
        self.in_flight_tasks = set()

    async def register(self):
        async with AsyncSessionLocal() as session:
            worker = Worker(id=WORKER_ID, hostname=HOSTNAME, status='Active')
            session.add(worker)
            await session.commit()
            logger.info(f"Worker {WORKER_ID} registered on {HOSTNAME}")

    async def deregister(self):
        async with AsyncSessionLocal() as session:
            worker = await session.get(Worker, WORKER_ID)
            if worker:
                worker.status = 'Offline'
                await session.commit()
                logger.info(f"Worker {WORKER_ID} deregistered")

    async def heartbeat(self):
        while self.is_running:
            try:
                async with AsyncSessionLocal() as session:
                    worker = await session.get(Worker, WORKER_ID)
                    if worker:
                        worker.last_seen = datetime.utcnow()
                        await session.commit()
            except Exception as e:
                logger.error(f"Heartbeat error: {e}")
            await asyncio.sleep(15) # Heartbeat every 15 seconds

    async def claim_job(self) -> Job:
        query = """
        UPDATE jobs
        SET status = 'Claimed', updated_at = NOW()
        WHERE id = (
            SELECT id FROM jobs 
            WHERE status IN ('Queued', 'Scheduled') 
              AND run_at <= NOW() 
            ORDER BY priority DESC, created_at ASC 
            LIMIT 1 
            FOR UPDATE SKIP LOCKED
        )
        RETURNING *;
        """
        async with AsyncSessionLocal() as session:
            result = await session.execute(text(query))
            row = result.fetchone()
            await session.commit()
            
            if row:
                # We need the full SQLAlchemy model to interact with it easily
                return await session.get(Job, row.id)
            return None

    async def execute_job(self, job: Job):
        async with AsyncSessionLocal() as session:
            # Create Execution record
            execution = JobExecution(job_id=job.id, worker_id=WORKER_ID, status='Running')
            session.add(execution)
            await session.commit()
            await session.refresh(execution)

            try:
                # SIMULATE JOB EXECUTION LOGIC
                logger.info(f"Executing Job {job.id} of type {job.type}")
                await asyncio.sleep(2) # Simulate work
                
                # Success
                execution.status = 'Completed'
                execution.completed_at = datetime.utcnow()
                
                job = await session.get(Job, job.id)
                job.status = 'Completed'
                job.updated_at = datetime.utcnow()
                
                logger.info(f"Job {job.id} completed successfully")
                
            except Exception as e:
                # Failure
                logger.error(f"Job {job.id} failed: {e}")
                execution.status = 'Failed'
                execution.completed_at = datetime.utcnow()
                execution.error_reason = str(e)
                
                job = await session.get(Job, job.id)
                job.attempts += 1
                
                # Fetch Retry Policy
                retry_policy = await session.get(RetryPolicy, job.retry_policy_id) if job.retry_policy_id else None
                max_retries = retry_policy.max_retries if retry_policy else 3
                
                if job.attempts >= max_retries:
                    job.status = 'Failed'
                    # Move to DLQ
                    dlq_entry = DLQEntry(job_id=job.id, error_reason=str(e))
                    session.add(dlq_entry)
                else:
                    # Calculate next run_at
                    delay_ms = retry_policy.initial_delay_ms if retry_policy else 1000
                    if retry_policy and retry_policy.strategy == 'exponential':
                        delay_ms = min(delay_ms * (2 ** (job.attempts - 1)), retry_policy.max_delay_ms)
                    elif retry_policy and retry_policy.strategy == 'linear':
                        delay_ms = min(delay_ms * job.attempts, retry_policy.max_delay_ms)
                    
                    job.run_at = datetime.utcnow() + timedelta(milliseconds=delay_ms)
                    job.status = 'Scheduled'
                    
                job.updated_at = datetime.utcnow()

            finally:
                await session.commit()

    async def dead_worker_cleanup(self):
        while self.is_running:
            try:
                async with AsyncSessionLocal() as session:
                    # Find workers not seen in last 60 seconds
                    cutoff = datetime.utcnow() - timedelta(seconds=60)
                    result = await session.execute(
                        text("SELECT id FROM workers WHERE last_seen < :cutoff AND status != 'Offline'"),
                        {'cutoff': cutoff}
                    )
                    dead_workers = [row.id for row in result.fetchall()]
                    
                    for w_id in dead_workers:
                        # Re-queue jobs claimed by dead worker
                        await session.execute(
                            text("UPDATE jobs SET status = 'Queued', updated_at = NOW() WHERE id IN (SELECT job_id FROM job_executions WHERE worker_id = :w_id AND status = 'Running')"),
                            {'w_id': w_id}
                        )
                        # Mark worker offline
                        await session.execute(
                            text("UPDATE workers SET status = 'Offline' WHERE id = :w_id"),
                            {'w_id': w_id}
                        )
                        logger.warning(f"Re-queued jobs and marked worker {w_id} offline")
                    await session.commit()
            except Exception as e:
                logger.error(f"Cleanup error: {e}")
            await asyncio.sleep(60)

    async def process_jobs(self):
        while self.is_running:
            job = await self.claim_job()
            if job:
                task = asyncio.create_task(self.execute_job(job))
                self.in_flight_tasks.add(task)
                task.add_done_callback(self.in_flight_tasks.discard)
            else:
                await asyncio.sleep(1) # Backoff if no jobs

    async def shutdown(self, sig):
        logger.info(f"Received signal {sig.name}. Shutting down gracefully...")
        self.is_running = False
        
        async with AsyncSessionLocal() as session:
            worker = await session.get(Worker, WORKER_ID)
            if worker:
                worker.status = 'ShuttingDown'
                await session.commit()

        if self.in_flight_tasks:
            logger.info(f"Waiting for {len(self.in_flight_tasks)} in-flight tasks to complete...")
            await asyncio.gather(*self.in_flight_tasks, return_exceptions=True)

        await self.deregister()
        logger.info("Shutdown complete.")

    async def run(self):
        await self.register()
        
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, lambda s=sig: asyncio.create_task(self.shutdown(s)))

        heartbeat_task = asyncio.create_task(self.heartbeat())
        cleanup_task = asyncio.create_task(self.dead_worker_cleanup())
        process_task = asyncio.create_task(self.process_jobs())

        await asyncio.gather(heartbeat_task, cleanup_task, process_task, return_exceptions=True)


if __name__ == "__main__":
    service = WorkerService()
    try:
        asyncio.run(service.run())
    except KeyboardInterrupt:
        pass
