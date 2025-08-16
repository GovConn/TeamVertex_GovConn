from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from sqlalchemy.types import String
from app.models.services_model import GovServiceCategory
from app.models.service_ratings_model import ServiceRating
from app.models.reservation_services_model import ReservationSlots

def fetch_most_reserved_slots(reservation_id: int, db: Session):
    return db.query(
        func.cast(ReservationSlots.booking_date, String).label("booking_date"),
        func.max(ReservationSlots.reserved_count).label("max_reserved"),
        func.cast(ReservationSlots.start_time, String).label("start_time")
    ).filter(ReservationSlots.reservation_id == reservation_id) \
    .group_by(ReservationSlots.booking_date, ReservationSlots.start_time) \
    .order_by(ReservationSlots.booking_date).all()

def fetch_appointment_percentage_change(reservation_id: int, db: Session):
    today_count = db.query(func.count(ReservationSlots.slot_id)).filter(
        func.date(ReservationSlots.booking_date) == func.current_date(),
        ReservationSlots.reservation_id == reservation_id
    ).scalar()
    yesterday_count = db.query(func.count(ReservationSlots.slot_id)).filter(
        func.date(ReservationSlots.booking_date) == func.current_date() - 1,
        ReservationSlots.reservation_id == reservation_id
    ).scalar()
    percentage_change = ((today_count - yesterday_count) / yesterday_count * 100) if yesterday_count > 0 else None
    return percentage_change

def fetch_today_appointment_count(reservation_id: int, db: Session):
    return db.query(func.count(ReservationSlots.slot_id)).filter(
        func.date(ReservationSlots.booking_date) == func.current_date(),
        ReservationSlots.reservation_id == reservation_id
    ).scalar()

def fetch_overall_satisfaction(db: Session):
    return db.query(
        GovServiceCategory.category_en,
        func.avg(ServiceRating.rating).label("avg_rating")
    ).join(ServiceRating, GovServiceCategory.id == ServiceRating.service_id).group_by(GovServiceCategory.category_en).all()
