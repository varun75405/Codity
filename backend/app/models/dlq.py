class DLQEntry(Base):
    __tablename__ = 'dlq_entries'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey('jobs.id'), nullable=False)
    error_reason = Column(Text, nullable=False)
    moved_at = Column(DateTime, default=datetime.utcnow)
