from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class ServiceRatingBase(BaseModel):
    rating_id: Optional[int] = Field(None, description="Unique identifier for the service rating")
    service_id: int = Field(..., description="ID of the related service")
    service_node_id: int = Field(..., description="ID of the related node")
    rating: int = Field(..., ge=1, le=5, description="Rating value (1-5)")
    comment: Optional[str] = Field(None, description="Optional comment")
    created_at: datetime = Field(default_factory=lambda: datetime.now(), description="Timestamp when the rating was created")

class ServiceRatingCreate(BaseModel):
    service_id: int = Field(..., description="ID of the related service")
    service_node_id: int = Field(..., description="ID of the related node")
    rating: int = Field(..., ge=1, le=5, description="Rating value (1-5)")
    comment: Optional[str] = Field(None, description="Optional comment")
    created_at: datetime = Field(default_factory=lambda: datetime.now(), description="Timestamp when the rating was created")

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "service_id": 1,
                "service_node_id": 2,
                "rating": 4,
                "comment": "Very helpful staff.",
            }
        }
    )

class ServiceRatingUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5, description="Rating value (1-5)")
    comment: Optional[str] = Field(None, description="Optional comment")

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "rating": 4,
                "comment": "Very helpful staff."
            }
        }
    )

class ServiceRatingResponse(ServiceRatingBase):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "rating_id": 1,
                "service_id": 10,
                "service_node_id": 2,
                "rating": 4,
                "comment": "Very helpful staff.",
                "created_at": "2025-08-14T12:00:00Z"
            }
        }
    )

