from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.citizen_model import Citizen
from app.schemas.reservation_schema import ReservationSlotSchema, ReservationSlotSchemaCreate, ReservedUser, ReservedUserCreate, ReservationSlotUpdate
from app.utils.auth import get_current_citizen, get_current_government_office
from app.crud import appointment_crud

router = APIRouter(
    prefix="/api/v1/appointments", 
    tags=["Appointments"]
)

@router.get("/available_slots/{reservation_id}/{reservation_date}", response_model=List[ReservationSlotSchema])
async def get_available_slots_by_date(reservation_id: int, reservation_date: str, db: Session = Depends(get_db)):
    return await appointment_crud.get_available_slots_by_date(reservation_id, reservation_date, db)

@router.get("/available_slots/{reservation_id}", response_model=List[ReservationSlotSchema])
async def get_available_slots(reservation_id: int, db: Session = Depends(get_db)):
    return await appointment_crud.get_available_slots(reservation_id, db)

@router.post("/create_slot", response_model=List[ReservationSlotSchema])
async def create_slot(slot_data: ReservationSlotSchemaCreate, db: Session = Depends(get_db)):
    return await appointment_crud.create_slot(slot_data, db)


@router.get("/slot/{slot_id}", response_model=ReservationSlotSchema)
async def get_slot(slot_id: int, db: Session = Depends(get_db)):
    return await appointment_crud.get_slot(slot_id, db)

@router.put("/slot/{slot_id}", response_model=ReservationSlotSchema)
async def update_slot(slot_id: int, slot_data: ReservationSlotUpdate, db: Session = Depends(get_db)):
    return await appointment_crud.update_slot(slot_id, slot_data, db)

@router.patch("/slot/{slot_id}/reserved_count")
async def modify_reserved_count(slot_id: int, action: str, db: Session = Depends(get_db)):
    return await appointment_crud.modify_reserved_count(slot_id, action, db)

@router.delete("/slot/{slot_id}")
async def delete_slot(slot_id: int, db: Session = Depends(get_db)):
    return await appointment_crud.delete_slot(slot_id, db)


@router.get("/reserved_user/{reference_id}", response_model=ReservedUser)
async def get_reserved_user(reference_id: int, db: Session = Depends(get_db)):
    return await appointment_crud.get_reserved_user(reference_id, db)

@router.post("/reserved_user", response_model=ReservedUser)
async def add_reserved_user(user_data: ReservedUserCreate, db: Session = Depends(get_db)):
    return await appointment_crud.add_reserved_user(user_data, db)

@router.delete("/reserved_user/{reference_id}")
async def delete_reserved_user(reference_id: int, db: Session = Depends(get_db)):
    return await appointment_crud.delete_reserved_user(reference_id, db)

@router.get("/reserved_user/get_slots/{nic}", response_model=List[ReservationSlotSchema])
async def get_reserved_slot_details(nic: str, db: Session = Depends(get_db)):
    return await appointment_crud.get_reserved_slot_details(nic, db)

@router.get("/reserved_user/get_users/{slot_id}", response_model=List[ReservedUser])
async def get_reserved_users(slot_id: int, db: Session = Depends(get_db)):
    return await appointment_crud.get_reserved_users(slot_id, db)

@router.delete("/slot/delete/{slot_id}")
async def delete_slot(slot_id: int, db: Session = Depends(get_db)):
    return await appointment_crud.delete_slot(slot_id, db)
