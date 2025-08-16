from typing import List
from app.db.session import get_db
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Depends
from app.crud import service_crud
from app.schemas import services_schema
from app.utils.auth import get_current_citizen

router = APIRouter(
    prefix="/api/v1/gov/services",
    tags=["Government Services"]
)

@router.get("/", response_model=List[services_schema.ServiceResponse])
async def get_services(db: Session = Depends(get_db)):
    services = await service_crud.get_all_services(db)
    return services

@router.post("/register", response_model=services_schema.ServiceResponse)
async def create_service(service: services_schema.ServiceCreate, db: Session = Depends(get_db)):
    new_service = await service_crud.create_service(service, db)
    if not new_service:
        raise HTTPException(status_code=400, detail="Service creation failed")
    return new_service


