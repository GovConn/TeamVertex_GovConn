from datetime import datetime, date, time
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from app.schemas.citizen_schema import CitizenResponse


class ReservedUser(BaseModel):
    reference_id: int
    slot_id: int
    citizen_nic: str
    citizen: Optional[CitizenResponse]

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "reference_id": 1,
                "slot_id": 2,
                "citizen_nic": "123456789V",
                "citizen": {
                    "nic": "123456789V",
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": "john.doe@example.com",
                    "phone": "123-456-7890",
                    "role": "user",
                    "document_link": [
                        {
                            "title": "Identity Document",
                            "url": "http://example.com/documents/123456789V"
                        },
                        {
                            "title": "Address Proof",
                            "url": "http://example.com/documents/123456789V/address"
                        }
                    ],
                    "active": True,
                    "created_at": "2025-08-09T07:00:00Z",
                }
            }
        }
    )

class ReservedUserCreate(BaseModel):
    slot_id: int
    citizen_nic: str

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "slot_id": 2,
                "citizen_nic": "123456789V",
            }
        }
    )


class ReservationSlotSchema(BaseModel):
    slot_id: int
    reservation_id: int
    start_time: time
    end_time: time
    max_capacity: int
    reserved_count: int
    status: str
    booking_date: date
    recurrent_count: int

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        json_encoders={
            time: lambda t: t.replace(microsecond=0).strftime("%H:%M:%S") if t else None
        },
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "slot_id": 1,
                "reservation_id": 1,
                "start_time": "07:00:00",
                "end_time": "08:00:00",
                "max_capacity": 10,
                "reserved_count": 5,
                "status": "available",
                "booking_date": "2025-08-09",
                "recurrent_count": 1
            }
        }
    )

class ReservationSlotSchemaCreate(BaseModel):
    reservation_id: int
    start_time: time
    end_time: time
    max_capacity: int
    reserved_count: int
    status: str
    booking_date: date
    recurrent_count: int

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        json_encoders={
            time: lambda t: t.replace(microsecond=0).strftime("%H:%M:%S") if t else None
        },
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "reservation_id": 1,
                "start_time": "07:00:00",
                "end_time": "08:00:00",
                "max_capacity": 10,
                "reserved_count": 5,
                "status": "available",
                "booking_date": "2025-08-09",
                "recurrent_count": 1
            }
        }
    )

class ReservationSlotUpdate(BaseModel):
    start_time: time
    end_time: time
    max_capacity: int
    reserved_count: int
    status: str
    booking_date: date

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        json_encoders={
            time: lambda t: t.replace(microsecond=0).strftime("%H:%M:%S") if t else None
        },
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "start_time": "07:00:00",
                "end_time": "08:00:00",
                "max_capacity": 10,
                "reserved_count": 5,
                "status": "available",
                "booking_date": "2025-08-09",
            }
        }
    )

class ReservedUserSlotsResponse(BaseModel):
    slots: List[ReservationSlotSchema]

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "slots": [
                    {
                        "slot_id": 1,
                        "reservation_id": 1,
                        "start_time": "07:00:00",
                        "end_time": "08:00:00",
                        "max_capacity": 10,
                        "reserved_count": 5,
                        "status": "available",
                        "booking_date": "2025-08-09",
                        "recurrent_count": 1
                    }
                ]
            }
        }
    )
