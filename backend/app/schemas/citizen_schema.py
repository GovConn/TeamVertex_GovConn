from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime


class DocumentJsonDict(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    url: str = Field(..., min_length=5, max_length=200)
    uploaded_at: datetime = Field(...)


class Citizen(BaseModel):
    id: Optional[int] = Field(None)
    nic: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=8)
    role: Literal["user", "normal"] = Field(..., description="Role of the citizen")
    active: bool = Field(default=False)
    document_links: Optional[List[DocumentJsonDict]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "nic": "123456789V",
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@gmail.com",
                "phone": "0712345678",
                "password": "Your password",
                "role": "user",
                "document_links": [
                    {
                        "title": "birth certificate",
                        "url": "https://example.com/birth_cert.pdf",
                        "uploaded_at": "2025-08-09T06:30:00Z"
                    },
                    {
                        "title": "license",
                        "url": "https://example.com/license.pdf",
                        "uploaded_at": "2025-08-09T07:00:00Z"
                    }
                ],
                "active": False,
                "created_at": "2025-08-09T07:00:00Z"
            }
        },
    )


class CitizenCreate(BaseModel):
    nic: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=8)
    role: Literal["user", "normal"] = Field(..., description="Role of the citizen")
    active: bool = Field(default=False)
    document_links: Optional[List[DocumentJsonDict]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "nic": "123456789V",
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@gmail.com",
                "phone": "0712345678",
                "password": "Your password",
                "role": "user",
                "document_links": [
                    {
                        "title": "birth certificate",
                        "url": "https://example.com/birth_cert.pdf",
                        "uploaded_at": "2025-08-09T06:30:00Z"
                    },
                    {
                        "title": "license",
                        "url": "https://example.com/license.pdf",
                        "uploaded_at": "2025-08-09T07:00:00Z"
                    }
                ],
                "active": False,
                "created_at": "2025-08-09T07:00:00Z"
            }
        },
    )


class CitizenResponse(BaseModel):
    id: Optional[int] = Field(None)
    nic: str = Field(..., min_length=3, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    phone: str = Field(..., min_length=10, max_length=15)
    role: Literal["user", "normal"] = Field(..., description="Role of the citizen")
    active: bool = Field(default=False)
    document_links: Optional[List[DocumentJsonDict]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "nic": "123456789V",
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@gmail.com",
                "phone": "0712345678",
                "role": "user",
                "document_links": [
                    {
                        "title": "birth certificate",
                        "url": "https://example.com/birth_cert.pdf",
                        "uploaded_at": "2025-08-09T06:30:00Z"
                    },
                    {
                        "title": "license",
                        "url": "https://example.com/license.pdf",
                        "uploaded_at": "2025-08-09T07:00:00Z"
                    }
                ],
                "active": False,
                "created_at": "2025-08-09T07:00:00Z"
            }
        },
    )


class CitizenLogin(BaseModel):
    nic: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "nic": "123456789V",
                "password": "Your password"
            }
        },
    )

class CitizenUpdate(BaseModel):
    nic: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "nic": "123456789V",
                "password": "Your new password",
            }
        },
    )

class CitizenUpdateDocumentLinks(BaseModel):
    nic: str = Field(..., min_length=3, max_length=50)
    document_links: Optional[List[DocumentJsonDict]] = Field(default_factory=list)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "nic": "123456789V",
                "document_links": [
                    {
                        "title": "birth certificate",
                        "url": "https://example.com/birth_cert.pdf",
                        "uploaded_at": "2025-08-09T06:30:00Z"
                    },
                    {
                        "title": "license",
                        "url": "https://example.com/license.pdf",
                        "uploaded_at": "2025-08-09T07:00:00Z"
                    }
                ],
            }
        },
    )
