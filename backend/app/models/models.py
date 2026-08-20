import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Text, JSON, Index, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from .base import Base

class Organization(Base):
    __tablename__ = 'organizations'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    users = relationship('User', back_populates='organization')
    projects = relationship('Project', back_populates='organization')

class User(Base):
    __tablename__ = 'users'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)
    
    organization = relationship('Organization', back_populates='users')

class Project(Base):
    __tablename__ = 'projects'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=False)
    name = Column(String, nullable=False)
    
    organization = relationship('Organization', back_populates='projects')
    queues = relationship('Queue', back_populates='project')

class RetryPolicy(Base):
    __tablename__ = 'retry_policies'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    strategy = Column(String, nullable=False) # 'fixed', 'linear', 'exponential'
    max_retries = Column(Integer, nullable=False, default=3)
    initial_delay_ms = Column(Integer, nullable=False, default=1000)
    max_delay_ms = Column(Integer, nullable=False, default=60000)

class Queue(Base):
    __tablename__ = 'queues'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id'), nullable=False)
    default_retry_policy_id = Column(UUID(as_uuid=True), ForeignKey('retry_policies.id'), nullable=True)
    name = Column(String, nullable=False)
    priority = Column(Integer, default=0)
    concurrency_limit = Column(Integer, default=10)
    is_paused = Column(Boolean, default=False)
    
    project = relationship('Project', back_populates='queues')
    jobs = relationship('Job', back_populates='queue')

class Job(Base):
    __tablename__ = 'jobs'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    queue_id = Column(UUID(as_uuid=True), ForeignKey('queues.id'), nullable=False)
    retry_policy_id = Column(UUID(as_uuid=True), ForeignKey('retry_policies.id'), nullable=True)
    type = Column(String, nullable=False)
    payload = Column(JSONB, nullable=False)
    status = Column(String, nullable=False, default='Queued') # 'Queued', 'Scheduled', 'Claimed', 'Running', 'Completed', 'Failed'
    attempts = Column(Integer, default=0)
    run_at = Column(DateTime, default=datetime.utcnow)
    max_retries = Column(Integer, default=3)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Bonus: Workflow Dependencies
    parent_job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=True)
    
    # Bonus: Queue Sharding
    shard_key = Column(String, index=True, default="default_shard")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    queue = relationship('Queue', back_populates='jobs')
    executions = relationship('JobExecution', back_populates='job')

    __table_args__ = (
        Index('ix_jobs_claim', 'status', 'run_at', 'priority'),
    )
    # wait, priority is on Queue, but we often query jobs by priority. To make SKIP LOCKED fast by priority,
    # we might need to denormalize priority onto the Job. Let's add priority to Job.
    priority = Column(Integer, default=0)

class JobExecution(Base):
    __tablename__ = 'job_executions'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey('jobs.id'), nullable=False)
    worker_id = Column(UUID(as_uuid=True), ForeignKey('workers.id'), nullable=False)
    status = Column(String, nullable=False, default='Running') # 'Running', 'Completed', 'Failed'
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_reason = Column(Text, nullable=True)
    
    job = relationship('Job', back_populates='executions')
    worker = relationship('Worker', back_populates='executions')
    logs = relationship('JobLog', back_populates='execution')

class JobLog(Base):
    __tablename__ = 'job_logs'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_execution_id = Column(UUID(as_uuid=True), ForeignKey('job_executions.id'), nullable=False)
    level = Column(String, nullable=False, default='INFO')
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    execution = relationship('JobExecution', back_populates='logs')

class Worker(Base):
    __tablename__ = 'workers'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hostname = Column(String, nullable=False)
    status = Column(String, nullable=False, default='Active') # 'Active', 'ShuttingDown', 'Offline'
    last_seen = Column(DateTime, default=datetime.utcnow)
    
    executions = relationship('JobExecution', back_populates='worker')

class DLQEntry(Base):
    __tablename__ = 'dlq_entries'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey('jobs.id'), nullable=False)
    error_reason = Column(Text, nullable=False)
    ai_failure_summary = Column(Text, nullable=True) # Bonus: AI-generated failure summaries
    moved_at = Column(DateTime, default=datetime.utcnow)
    
    job = relationship('Job')
class RecurringJob(Base):
    __tablename__ = 'recurring_jobs'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    queue_id = Column(UUID(as_uuid=True), ForeignKey('queues.id'), nullable=False)
    type = Column(String, nullable=False)
    payload = Column(JSONB, nullable=False)
    cron_expression = Column(String, nullable=False)
    last_scheduled_at = Column(DateTime, nullable=True)
    is_paused = Column(Boolean, default=False)
