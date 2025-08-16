from pydantic import BaseModel
from typing import List, Optional

class MostReservedSlotSchema(BaseModel):
    booking_date: str
    max_reserved: int
    start_time: str

class AppointmentPercentageChangeSchema(BaseModel):
    percentage_change: Optional[float]

class TodayAppointmentCountSchema(BaseModel):
    today_count: int

class OverallSatisfactionSchema(BaseModel):
    category_en: str
    avg_rating: float
