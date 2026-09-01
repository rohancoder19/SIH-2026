from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from app.database.db import Base

class SIHProblemStatement(Base):
    """
    SQLAlchemy model for storing scraped SIH 2026 Problem Statements.
    """
    __tablename__ = "sih_problem_statements"

    id = Column(String(50), primary_key=True, index=True)
    serial_no = Column(Integer, nullable=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    organization = Column(String(255), nullable=False, index=True)
    department = Column(String(255), nullable=True)
    category = Column(String(50), default="Software", index=True)  # Software, Hardware
    theme = Column(String(120), default="General", index=True)
    description = Column(Text, nullable=False)
    background = Column(Text, nullable=True)
    expected_solution = Column(Text, nullable=True)
    deadline = Column(String(100), nullable=True)
    submitted_ideas = Column(String(50), nullable=True)
    references = Column(JSON, nullable=True)  # [{"title": "...", "url": "..."}]
    source_url = Column(String(255), default="https://www.sih.gov.in/sih2026PS")
    scraped_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
