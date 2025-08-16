from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class Service(BaseModel):
    id: int
    category_si: str
    category_en: str
    category_ta: str
    description_si: str
    description_en: str
    description_ta: str
    created_at: datetime

class ServiceCreate(BaseModel):
    category_si: str
    category_en: str
    category_ta: str
    description_si: str
    description_en: str
    description_ta: str

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "category_si": "සේවා කාණ්ඩ සිංහල",
                "category_en": "Service Category English",
                "category_ta": "சேவை வகை தமிழ்",
                "description_si": "මෙය සේවා කාණ්ඩයක විස්තරය.",
                "description_en": "This is a description of the service category.",
                "description_ta": "இது சேவை வகையின் விளக்கம்."
            }
        }
    )

class ServiceResponse(Service):
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "category_si": "සේවා කාණ්ඩ සිංහල",
                "category_en": "Service Category English",
                "category_ta": "சேவை வகை தமிழ்",
                "description_si": "මෙය සේවා කාණ්ඩයක විස්තරය.",
                "description_en": "This is a description of the service category.",
                "description_ta": "இது சேவை வகையின் விளக்கம்.",
                "created_at": "2023-01-01T00:00:00Z"
            }
        }
    )
