from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.notification_schema import NotificationRequest, NotificationCreate, NotificationResponse, NotificationUpdate
from app.crud import notification_crud

router = APIRouter(
    prefix="/api/v1/notifications",
    tags=["notifications"]
)

@router.post("/create", response_model=NotificationResponse)
async def create_notifications(notification: NotificationCreate, db: Session = Depends(get_db)):
    return await notification_crud.create_notification(notification, db)

@router.post("/get", response_model=List[NotificationResponse])
async def get_notifications(request: NotificationRequest, db: Session = Depends(get_db)):
    return await notification_crud.get_all_notifications(request, db)

@router.delete("/delete/{notification_id}", response_model=dict)
async def delete_notifications(notification_id: int, db: Session = Depends(get_db)):
    return await notification_crud.delete_notification(notification_id, db)

@router.put("/update/", response_model=NotificationResponse)
async def update_notifications(notification: NotificationUpdate, db: Session = Depends(get_db)):
    return await notification_crud.update_notification(notification, db)