from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime

class DocumentTypeBase(BaseModel):
    id: int
    name_si: str
    name_en: str
    name_ta: str
    description_si: Optional[str] = None
    description_en: Optional[str] = None
    description_ta: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "name_si": "අත්‍යවශ්‍ය ලේඛනය",
                "name_en": "Essential Document",
                "name_ta": "அவசியமான ஆவணம்",
                "description_si": "මෙය අත්‍යවශ්‍ය ලේඛනයකි.",
                "description_en": "This is an essential document.",
                "description_ta": "இது அவசியமான ஆவணம்.",
            }
        }
    )
    
class DocumentTypeCreate(BaseModel):
    name_si: str
    name_en: str
    name_ta: str
    description_si: Optional[str] = None
    description_en: Optional[str] = None
    description_ta: Optional[str] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "name_si": "අත්‍යවශ්‍ය ලේඛනය",
                "name_en": "Essential Document",
                "name_ta": "அவசியமான ஆவணம்",
                "description_si": "මෙය අත්‍යවශ්‍ය ලේඛනයකි.",
                "description_en": "This is an essential document.",
                "description_ta": "இது அவசியமான ஆவணம்.",
            }
        }
    )   