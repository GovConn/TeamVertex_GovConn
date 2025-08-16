from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class Citizen(Base):
    __tablename__ = "citizens"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nic = Column(String, unique=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, unique=True)
    password = Column(String)
    role = Column(String, default="user")
    active = Column(Boolean, default=False)
    document_links = Column(JSON) # documents as Json dictionary
    created_at = Column(DateTime, default=datetime.now)

    reservations = relationship("ReservedUser", back_populates="citizen")