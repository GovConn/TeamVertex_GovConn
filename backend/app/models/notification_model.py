from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nic = Column(String, nullable=False)
    message = Column(String, nullable=False)
    status = Column(String, default="info")
    created_at = Column(DateTime, default=datetime.now)