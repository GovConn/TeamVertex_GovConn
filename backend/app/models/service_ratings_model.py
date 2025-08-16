from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class ServiceRating(Base):
    __tablename__ = "service_ratings"

    rating_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    service_id = Column(Integer, ForeignKey("gov_node_services.service_id"), index=True)
    service_node_id = Column(Integer, ForeignKey("gov_nodes.id"), index=True)
    rating = Column(Integer, nullable=False, default=0)
    comment = Column(String, nullable=True, default="")
    created_at = Column(DateTime, default=datetime.now)

    # service = relationship("GovNodeService", back_populates="ratings")