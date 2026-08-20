from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from typing import Optional, Dict, Any, List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    organization_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    organization_id: UUID

    class Config:
        orm_mode = True

# --- Retry Policy Schemas ---
class RetryPolicyCreate(BaseModel):
    name: str
    strategy: str = Field(..., description="'fixed', 'linear', 'exponential'")
    max_retries: int = Field(3, ge=0)
    initial_delay_ms: int = Field(1000, ge=0)
    max_delay_ms: int = Field(60000, ge=0)

class RetryPolicyResponse(RetryPolicyCreate):
    id: UUID

    class Config:
        orm_mode = True

# --- Queue Schemas ---
class QueueCreate(BaseModel):
    name: str
    project_id: UUID
    priority: int = 0
    concurrency_limit: int = Field(10, gt=0)
    default_retry_policy_id: Optional[UUID] = None

class QueueUpdate(BaseModel):
    priority: Optional[int] = None
    concurrency_limit: Optional[int] = Field(None, gt=0)
    is_paused: Optional[bool] = None
    default_retry_policy_id: Optional[UUID] = None

class QueueResponse(QueueCreate):
    id: UUID
    is_paused: bool

    class Config:
        orm_mode = True

# --- Job Schemas ---
class JobCreate(BaseModel):
    type: str
    payload: Dict[str, Any]
    run_at: Optional[datetime] = None
    retry_policy_id: Optional[UUID] = None
    priority: Optional[int] = None # Overrides queue priority if provided

class BatchJobCreate(BaseModel):
    jobs: List[JobCreate]

class JobResponse(BaseModel):
    id: UUID
    queue_id: UUID
    type: str
    payload: Dict[str, Any]
    status: str
    attempts: int
    run_at: datetime
    priority: int
    created_at: datetime

    class Config:
        orm_mode = True
