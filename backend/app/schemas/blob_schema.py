from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime

class BlobMetadata(BaseModel):
    filename: str = Field(..., min_length=3, max_length=100)
    content_type: str = Field(..., min_length=3, max_length=100)
    size: int = Field(..., gt=0)
    uploaded_at: datetime = Field(default_factory=datetime.now)

class BlobCreate(BaseModel):
    filename: str
    file: bytes
    content_type: str

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "filename": "example",
                "file": "base64-encoded-file-content",
                "content_type": "pdf"
            }
        }
    )

class BlobResponse(BaseModel):
    filename: str
    url: str
    uploaded_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "filename": "example.txt",
                "url": "https://example.com/blob/example.txt",
                "uploaded_at": "2023-01-01T00:00:00Z"
            }
        }
    )
