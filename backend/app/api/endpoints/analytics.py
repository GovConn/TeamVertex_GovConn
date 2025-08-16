from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.crud.analytics_crud import (
    fetch_most_reserved_slots, fetch_appointment_percentage_change,
    fetch_today_appointment_count, fetch_overall_satisfaction
)
from app.schemas.analytics_schema import (
    MostReservedSlotSchema, AppointmentPercentageChangeSchema,
    TodayAppointmentCountSchema, OverallSatisfactionSchema
)

router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["Analytics"]
)

@router.get("/appointments/most_reserved_slot/{service_id}", response_model=List[MostReservedSlotSchema])
async def get_most_reserved_slot(service_id : int, db: Session = Depends(get_db)):
    return fetch_most_reserved_slots(service_id, db)

@router.get("/appointments/percentage_change/{service_id}", response_model=AppointmentPercentageChangeSchema)
async def get_appointment_percentage_change(service_id: int, db: Session = Depends(get_db)):
    percentage_change = fetch_appointment_percentage_change(service_id, db)
    return {"percentage_change": percentage_change}

@router.get("/appointments/today_count/{service_id}", response_model=TodayAppointmentCountSchema)
async def get_today_appointment_count(service_id: int, db: Session = Depends(get_db)):
    today_count = fetch_today_appointment_count(service_id, db)
    return {"today_count": today_count}

@router.get("/services/overall_satisfaction/", response_model=List[OverallSatisfactionSchema])
async def get_overall_satisfaction(db: Session = Depends(get_db)):
    return fetch_overall_satisfaction(db)
