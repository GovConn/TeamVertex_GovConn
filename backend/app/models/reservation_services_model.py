from sqlalchemy import Column, Integer, String, Time, DateTime, ForeignKey, Boolean, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime, time

class ReservedUser(Base):
    __tablename__ = "reserved_users"

    reference_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # reservation_id = Column(Integer, ForeignKey("reservation_slots.reservation_id"), index=True)
    slot_id = Column(Integer, ForeignKey("reservation_slots.slot_id"), index=True)
    citizen_nic = Column(String, ForeignKey("citizens.nic"), index=True)

    citizen = relationship("Citizen", back_populates="reservations")
    slot = relationship("ReservationSlots", back_populates="reserved_users")

class ReservationSlots(Base):
    __tablename__ = "reservation_slots"

    slot_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reservation_id = Column(Integer, ForeignKey("gov_node_services.service_id"), index=True)
    start_time = Column(Time, default=lambda: datetime.now().time().replace(microsecond=0))
    end_time = Column(Time, default=lambda: datetime.now().time().replace(microsecond=0))
    max_capacity = Column(Integer, default=1)
    reserved_count = Column(Integer, default=0)
    status = Column(String, default="pending")
    booking_date = Column(Date, nullable=False, default=datetime.now().date())
    recurrent_count = Column(Integer, default=0)

    # composite unique constraint
    __table_args__ = (
        UniqueConstraint("reservation_id", "start_time", "end_time", name="uq_reservation_slot"),
    )
    # when delete slot id its associated ReservedUser also needed to be deleted
    reserved_users = relationship("ReservedUser", back_populates="slot", cascade="all, delete-orphan")
    sub_services = relationship("GovNodeService", back_populates="reservation_slots")