from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.notification_model import Notification
from app.schemas.notification_schema import NotificationCreate, NotificationResponse, NotificationRequest, NotificationUpdate

async def delete_notification(notification_id: int, db: Session):
    try:
        notification = db.query(Notification).filter_by(notification_id=notification_id).first()
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        db.delete(notification)
        db.commit()
        return {"detail": "Notification deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting notification: {str(e)}")

async def create_notification(notification_data: NotificationCreate, db: Session) -> NotificationResponse:
    try:
        new_notification = Notification(
            nic=notification_data.nic,
            message=notification_data.message,
            status=notification_data.status,
        )
        db.add(new_notification)
        db.commit()
        db.refresh(new_notification)
        return NotificationResponse(
            notification_id=new_notification.notification_id,
            nic=new_notification.nic,
            message=new_notification.message,
            status=new_notification.status,
            created_at=new_notification.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating notification: {str(e)}")

async def get_all_notifications(req: NotificationRequest, db: Session) -> list[NotificationResponse]:
    try:
        notifications = db.query(Notification).filter(Notification.nic == req.nic).order_by(Notification.created_at.desc()).offset(req.start_count).limit(req.limit).all()
        return [NotificationResponse(
            notification_id=n.notification_id,
            nic=n.nic,
            message=n.message,
            status=n.status,
            created_at=n.created_at
        ) for n in notifications]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notifications: {str(e)}")

async def update_notification(notification_data: NotificationUpdate, db: Session) -> NotificationResponse:
    try:
        notification = db.query(Notification).filter_by(notification_id=notification_data.notification_id).first()
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")

        # Update notification fields
        notification.message = notification_data.message or notification.message
        notification.status = notification_data.status or notification.status

        db.commit()
        db.refresh(notification)
        return NotificationResponse(
            notification_id=notification.notification_id,
            nic=notification.nic,
            message=notification.message,
            status=notification.status,
            created_at=notification.created_at
        )
    
    except HTTPException as error:
        raise error

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating notification: {str(e)}")
