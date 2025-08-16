from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class GovNode(BaseModel):
    id: Optional[int] = Field()
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)
    category_id: int = Field(..., description="Foreign key to the government service category")
    location: str = Field(..., min_length=3, max_length=100)
    name_si: str = Field(..., min_length=3, max_length=100)
    name_en: str = Field(..., min_length=3, max_length=100)
    name_ta: str = Field(..., min_length=3, max_length=100)
    role: str = Field(..., pattern=r'^(user|admin)$')
    description_si: str = Field(..., min_length=10, max_length=500)
    description_en: str = Field(..., min_length=10, max_length=500)
    description_ta: str = Field(..., min_length=10, max_length=500)
    created_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "email": "gov@example.com",
                "username": "gov_user",
                "password": "securepassword",
                "category_id": 1,
                "location": "Colombo",
                "name_si": "රජයේ නෝඩ් එක",
                "name_en": "Government Node",
                "name_ta": "அரசாங்க நொடி",
                "role": "user",
                "description_si": "මෙය රජයේ නෝඩ් එකකි.",
                "description_en": "This is a government node.",
                "description_ta": "இது ஒரு அரசாங்க நொடி.",
                "created_at": "2023-01-01T00:00:00Z",
            }
        },
    )


class GovNodeCreate(BaseModel):
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)
    category_id: int = Field(..., description="Foreign key to the government service category")
    location: str = Field(..., min_length=3, max_length=100)
    name_si: str = Field(..., min_length=3, max_length=100)
    name_en: str = Field(..., min_length=3, max_length=100)
    name_ta: str = Field(..., min_length=3, max_length=100)
    role: str = Field(..., pattern=r'^(user|admin)$')
    description_si: str = Field(..., min_length=10, max_length=500)
    description_en: str = Field(..., min_length=10, max_length=500)
    description_ta: str = Field(..., min_length=10, max_length=500)
    created_at: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "email": "gov@example.com",
                "username": "gov_user",
                "password": "securepassword",
                "category_id": 1,
                "location": "Colombo",
                "name_si": "රජයේ නෝඩ් එක",
                "name_en": "Government Node",
                "name_ta": "அரசாங்க நொடி",
                "role": "user",
                "description_si": "මෙය රජයේ නෝඩ් එකකි.",
                "description_en": "This is a government node.",
                "description_ta": "இது ஒரு அரசாங்க நொடி.",
            }
        },
    )

class GovNodeResponse(BaseModel):
    id: int
    email: str
    username: str
    location: str
    category_id: int
    name_si: str
    name_en: str
    name_ta: str
    role: str
    description_si: str
    description_en: str
    description_ta: str
    created_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "email": "gov@example.com",
                "username": "gov_user",
                "location": "Colombo",
                "category_id": 1,
                "name_si": "රජයේ නෝඩ් එක",
                "name_en": "Government Node",
                "name_ta": "அரசாங்க நொடி",
                "role": "user",
                "description_si": "මෙය රජයේ නෝඩ් එකකි.",
                "description_en": "This is a government node.",
                "description_ta": "இது ஒரு அரசாங்க நொடி.",
                "created_at": "2023-01-01T00:00:00Z",
            }
        },
    )

class GovLogin(BaseModel):
    email: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "email": "gov_user@example.com",
                "password": "securepassword",
            }
        },
    )
