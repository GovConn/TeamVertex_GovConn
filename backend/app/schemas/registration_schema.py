from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class DocumentJsonDict(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    url: str = Field(..., min_length=5, max_length=200)
    uploaded_at: datetime = Field(..., default_factory=datetime.now)

class Registration(BaseModel):
    reference_id: int
    nic: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., min_length=5, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    role: str = Field(default="user")
    active: bool = Field(default=False)
    document_links: Optional[list[DocumentJsonDict]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "reference_id": 1,
                "nic": "123456789V",
                "first_name": "John",
                "last_name": "Doe",
                "email": "example@example.com",
                "phone": "0712345678",
                "active": True,
                "document_links": [
                    {
                        "title": "Document 1",
                        "url": "http://example.com/doc1",
                    }
                ],
            }
        }
    )

class RegistrationResponse(Registration):
    pass

class RegistrationCreate(BaseModel):
    nic: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., min_length=5, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    role: str = Field(default="user")
    active: bool = Field(default=False)
    document_links: Optional[list[DocumentJsonDict]] = Field(default_factory=list)

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "nic": "123456789V",
                "first_name": "John",
                "last_name": "Doe",
                "email": "example@example.com",
                "phone": "0712345678",
                "active": True,
                "document_links": [
                    {
                        "title": "Document 1",
                        "url": "http://example.com/doc1",
                    }
                ]
            }
        }
    )
