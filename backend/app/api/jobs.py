from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import UUID
from datetime import datetime

from ..core.database import get_db
from ..models.models import Job, Queue, Project, User
from .schemas import JobCreate, BatchJobCreate, JobResponse
from .deps import get_current_user

router = APIRouter()

async def verify_queue_access(queue_id: UUID, db: AsyncSession, current_user: User) -> Queue:
    result = await db.execute(
        select(Queue).join(Project).where(
            Queue.id == queue_id, 
            Project.organization_id == current_user.organization_id
        )
    )
    queue = result.scalars().first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")
    return queue

@router.post("/{queue_id}/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    queue_id: UUID, 
    job_in: JobCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    queue = await verify_queue_access(queue_id, db, current_user)
    
    run_time = job_in.run_at or datetime.utcnow()
    job_status = "Scheduled" if job_in.run_at and job_in.run_at > datetime.utcnow() else "Queued"
    priority = job_in.priority if job_in.priority is not None else queue.priority
    
    job = Job(
        queue_id=queue.id,
        retry_policy_id=job_in.retry_policy_id or queue.default_retry_policy_id,
        type=job_in.type,
        payload=job_in.payload,
        status=job_status,
        run_at=run_time,
        priority=priority
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job

@router.post("/{queue_id}/jobs/batch", response_model=List[JobResponse], status_code=status.HTTP_201_CREATED)
async def create_batch_jobs(
    queue_id: UUID, 
    batch_in: BatchJobCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    queue = await verify_queue_access(queue_id, db, current_user)
    
    jobs_to_create = []
    now = datetime.utcnow()
    
    for job_in in batch_in.jobs:
        run_time = job_in.run_at or now
        job_status = "Scheduled" if job_in.run_at and job_in.run_at > now else "Queued"
        priority = job_in.priority if job_in.priority is not None else queue.priority
        
        job = Job(
            queue_id=queue.id,
            retry_policy_id=job_in.retry_policy_id or queue.default_retry_policy_id,
            type=job_in.type,
            payload=job_in.payload,
            status=job_status,
            run_at=run_time,
            priority=priority
        )
        jobs_to_create.append(job)
    
    db.add_all(jobs_to_create)
    await db.commit()
    
    # Refreshing all is not efficient in batch, but needed to return IDs. 
    # For large batches, a different return strategy might be needed, but this works for standard usage.
    for job in jobs_to_create:
        await db.refresh(job)
        
    return jobs_to_create

@router.get("/{queue_id}/jobs", response_model=List[JobResponse])
async def list_jobs(
    queue_id: UUID,
    status: str = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await verify_queue_access(queue_id, db, current_user)
    
    query = select(Job).where(Job.queue_id == queue_id)
    if status:
        query = query.where(Job.status == status)
        
    query = query.order_by(Job.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    
    return result.scalars().all()
