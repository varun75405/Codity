from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from typing import List
from uuid import UUID

from ..core.database import get_db
from ..models.models import Queue, Project, RetryPolicy, User
from .schemas import QueueCreate, QueueUpdate, QueueResponse, RetryPolicyCreate, RetryPolicyResponse
from .deps import get_current_user

router = APIRouter()

# --- Retry Policies ---
@router.post("/retry-policies", response_model=RetryPolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_retry_policy(policy_in: RetryPolicyCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    policy = RetryPolicy(**policy_in.dict())
    db.add(policy)
    await db.commit()
    await db.refresh(policy)
    return policy

@router.get("/retry-policies", response_model=List[RetryPolicyResponse])
async def list_retry_policies(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(RetryPolicy).offset(skip).limit(limit))
    return result.scalars().all()

# --- Queues ---
@router.post("/", response_model=QueueResponse, status_code=status.HTTP_201_CREATED)
async def create_queue(queue_in: QueueCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify project belongs to user's org
    result = await db.execute(select(Project).where(Project.id == queue_in.project_id, Project.organization_id == current_user.organization_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Project not found")

    queue = Queue(**queue_in.dict())
    db.add(queue)
    await db.commit()
    await db.refresh(queue)
    return queue

@router.get("/", response_model=List[QueueResponse])
async def list_queues(
    project_id: UUID = Query(...), 
    skip: int = 0, 
    limit: int = 50, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Verify project ownership
    result = await db.execute(select(Project).where(Project.id == project_id, Project.organization_id == current_user.organization_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Project not found")

    result = await db.execute(select(Queue).where(Queue.project_id == project_id).offset(skip).limit(limit))
    return result.scalars().all()

@router.patch("/{queue_id}", response_model=QueueResponse)
async def update_queue(queue_id: UUID, queue_in: QueueUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if queue exists and user has access
    result = await db.execute(select(Queue).join(Project).where(Queue.id == queue_id, Project.organization_id == current_user.organization_id))
    queue = result.scalars().first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")

    update_data = queue_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(queue, key, value)
    
    await db.commit()
    await db.refresh(queue)
    return queue
