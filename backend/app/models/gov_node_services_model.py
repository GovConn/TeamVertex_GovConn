from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class GovNodeService(Base):
    __tablename__ = "gov_node_services"

    service_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    gov_node_id = Column(Integer, ForeignKey("gov_nodes.id"), index=True)
    service_type = Column(String, index=True)
    service_name_si = Column(String)
    service_name_en = Column(String)
    service_name_ta = Column(String)
    description_si = Column(String)
    description_en = Column(String)
    description_ta = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now)
    is_active = Column(Boolean, default=True)
    required_document_types = Column(ARRAY(Integer), default=list)

    reservation_slots = relationship("ReservationSlots", back_populates="sub_services", cascade="all, delete-orphan")