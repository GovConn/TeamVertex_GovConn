from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

# ALTER SEQUENCE registrations_reference_id_seq RESTART WITH 1000;


class Registration(Base):
    __tablename__ = "registrations"

    reference_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nic = Column(String, unique=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, unique=True)
    role = Column(String, default="user")
    active = Column(Boolean, default=False)
    document_links = Column(JSON)
    created_at = Column(DateTime, default=datetime.now)
