from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class GovServiceCategory(Base):
    __tablename__ = "gov_service_categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category_si = Column(String, index=True)
    category_en = Column(String, index=True, nullable=False)
    category_ta = Column(String, index=True)
    description_si = Column(String)
    description_en = Column(String, nullable=False)
    description_ta = Column(String)
    created_at = Column(DateTime, default=datetime.now)

    # offices = relationship("GovNode", back_populates="gov_service_category")
