import asyncio
import os
import sys
import logging
from datetime import datetime
from croniter import croniter

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.models.models import Job, RecurringJob

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] Dispatcher: %(message)s')
logger = logging.getLogger("dispatcher")

_db_url = os.environ.get("DATABASE_URL", "postgresql://user:password@localhost:5432/job_scheduler")
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

DATABASE_URL = _db_url
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class DispatcherService:
    def __init__(self):
        self.is_running = True

    async def evaluate_cron_jobs(self):
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT id FROM recurring_jobs WHERE is_paused = False"))
            recurring_jobs_ids = [row.id for row in result.fetchall()]

            now = datetime.utcnow()
            for r_id in recurring_jobs_ids:
                r_job = await session.get(RecurringJob, r_id)
                if not r_job:
                    continue
                
                # Check if it's time to run
                base_time = r_job.last_scheduled_at or now
                cron = croniter(r_job.cron_expression, base_time)
                next_run = cron.get_next(datetime)
                
                if next_run <= now:
                    logger.info(f"Dispatching recurring job {r_job.id} at {next_run}")
                    # Enqueue new job
                    new_job = Job(
                        queue_id=r_job.queue_id,
                        type=r_job.type,
                        payload=r_job.payload,
                        status='Queued',
                        run_at=next_run
                    )
                    session.add(new_job)
                    r_job.last_scheduled_at = now
                    
            await session.commit()

    async def run(self):
        logger.info("Dispatcher started.")
        while self.is_running:
            try:
                await self.evaluate_cron_jobs()
            except Exception as e:
                logger.error(f"Error evaluating cron jobs: {e}")
            
            await asyncio.sleep(60) # Evaluate every minute

if __name__ == "__main__":
    service = DispatcherService()
    try:
        asyncio.run(service.run())
    except KeyboardInterrupt:
        logger.info("Dispatcher shutting down.")
