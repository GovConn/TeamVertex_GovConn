from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class Notification(BaseModel):
    notification_id: Optional[int] = Field(None, description="Unique identifier for the notification")
    nic: str = Field(..., min_length=3, max_length=50, description="NIC of the citizen receiving the notification")
    message: str = Field(..., min_length=1, max_length=500, description="Notification message content")
    status: str = Field(default="info", description="Status of the notification (e.g., info, warning, error)")
    created_at: datetime = Field(default_factory=datetime.now, description="Timestamp when the notification was created")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "notification_id": 1,
                "nic": "123456789V",
                "message": "Your registration has been successfully processed.",
                "status": "info",
                "created_at": "2025-08-09T07:00:00Z"
            }
        },
    )

class NotificationCreate(BaseModel):
    nic: str = Field(..., min_length=3, max_length=50, description="NIC of the citizen receiving the notification")
    message: str = Field(..., min_length=1, max_length=500, description="Notification message content")
    status: str = Field(default="info", description="Status of the notification (e.g., info, warning, error)")
    created_at: datetime = Field(default_factory=datetime.now, description="Timestamp when the notification was created")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "nic": "123456789V",
                "message": "Your registration has been successfully processed.",
                "status": "info",
            }
        },
    )

class NotificationResponse(Notification):
    pass

class NotificationRequest(BaseModel):
    nic: str = Field(..., min_length=3, max_length=50, description="NIC of the citizen to fetch notifications for")
    start_count: int = Field(0, ge=0, description="Starting count for pagination")
    limit: int = Field(10, gt=0, description="Maximum number of notifications to fetch")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "nic": "123456789V",
                "start_count": 0,
                "limit": 10
            }
        },
    )

class NotificationUpdate(BaseModel):
    notification_id: int = Field(..., description="Unique identifier for the notification")
    message: Optional[str] = Field(None, min_length=1, max_length=500, description="Notification message content")
    status: Optional[str] = Field(None, description="Status of the notification (e.g., viewed, dismissed)")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "notification_id": 1,
                "message": "Your registration has been successfully processed.",
                "status": "viewed"
            }
        },
    )