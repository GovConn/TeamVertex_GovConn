from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime

class GovNodeServiceBase(BaseModel):
    service_id: int
    gov_node_id: int
    service_type: str
    service_name_si: str
    service_name_en: str
    service_name_ta: str
    description_si: str
    description_en: str
    description_ta: str
    created_at: datetime
    updated_at: datetime
    is_active: bool
    required_document_types: list[int] = []

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "examples": [
                {
                    "service_id": 1,
                    "gov_node_id": 1,
                    "service_type": "public",
                    "service_name_si": "සේවා නාමය සිංහල",
                    "service_name_en": "Service Name English",
                    "service_name_ta": "சேவை பெயர் தமிழ்",
                    "description_si": "විස්තර සිංහල",
                    "description_en": "Description English",
                    "description_ta": "விளக்கம் தமிழ்",
                    "created_at": "2023-01-01T00:00:00Z",
                    "updated_at": "2023-01-01T00:00:00Z",
                    "is_active": True,
                    "required_document_types": [1, 2, 3]
                }
            ]
        },
        
    )

class GovNodeServiceCreate(BaseModel):
    gov_node_id: int
    service_type: str
    service_name_si: str
    service_name_en: str
    service_name_ta: str
    description_si: str
    description_en: str
    description_ta: str
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    updated_at: datetime
    is_active: bool
    required_document_types: list[int] = []

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "examples": [
                {
                    "gov_node_id": 1,
                    "service_type": "public",
                    "service_name_si": "සේවා නාමය සිංහල",
                    "service_name_en": "Service Name English",
                    "service_name_ta": "சேவை பெயர் தமிழ்",
                    "description_si": "විස්තර සිංහල",
                    "description_en": "Description English",
                    "description_ta": "விளக்கம் தமிழ்",
                    "updated_at": "2023-01-01T00:00:00Z",
                    "is_active": True,
                    "required_document_types": [1, 2, 3]
                }
            ]
        },
    )

class GovNodeServiceUpdate(BaseModel):
    service_type: str
    service_name_si: str
    service_name_en: str
    service_name_ta: str
    description_si: str
    description_en: str
    description_ta: str
    updated_at: datetime = Field(default_factory=lambda: datetime.now())
    is_active: bool
    required_document_types: list[int] = []

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "examples": [
                {
                    "service_type": "public",
                    "service_name_si": "සේවා නාමය සිංහල",
                    "service_name_en": "Service Name English",
                    "service_name_ta": "சேவை பெயர் தமிழ்",
                    "description_si": "විස්තර සිංහල",
                    "description_en": "Description English",
                    "description_ta": "விளக்கம் தமிழ்",
                    "is_active": True,
                    "required_document_types": [1, 2, 3]
                }
            ]
        },
        
    )


class GovNodeServiceResponse(GovNodeServiceBase):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "examples": [
                {
                    "gov_node_id": 1,
                    "service_type": "public",
                    "service_name_si": "සේවා නාමය සිංහල",
                    "service_name_en": "Service Name English",
                    "service_name_ta": "சேவை பெயர் தமிழ்",
                    "description_si": "විස්තර සිංහල",
                    "description_en": "Description English",
                    "description_ta": "விளக்கம் தமிழ்",
                    "created_at": "2023-01-01T00:00:00Z",
                    "updated_at": "2023-01-01T00:00:00Z",
                    "is_active": True,
                    "required_document_types": [1, 2, 3]
                }
            ]
        },
        
    )
