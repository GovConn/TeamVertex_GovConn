from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class GovNode(Base):
    __tablename__ = "gov_nodes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True)
    username = Column(String)
    password = Column(String)
    category_id = Column(Integer, ForeignKey("gov_service_categories.id"))
    category = relationship("GovServiceCategory")
    location = Column(String)
    name_si = Column(String)
    name_en = Column(String)
    name_ta = Column(String)
    role = Column(String, default="user")
    description_si = Column(String)
    description_en = Column(String)
    description_ta = Column(String)
    created_at = Column(DateTime, default=datetime.now)

    # gov_service_category = relationship("GovServiceCategory", back_populates="offices")
