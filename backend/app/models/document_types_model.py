from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, JSON

from app.db.base import Base
from datetime import datetime

class DocumentType(Base):
    __tablename__ = "document_types"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    type_si = Column(String, index=True)
    type_en = Column(String, index=True)
    type_ta = Column(String, index=True)
    description_si = Column(String)
    description_en = Column(String)
    description_ta = Column(String)
    
