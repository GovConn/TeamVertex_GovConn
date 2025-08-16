from typing import List
from app.db.session import get_db
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Depends
from app.crud import gov_node_services_crud
from app.schemas import gov_node_services_schema
from app.utils.auth import get_current_citizen, get_current_government_office

router = APIRouter(
    prefix="/api/v1/gov/services",
    tags=["Government Node Services"]
)

@router.post("/create", response_model=gov_node_services_schema.GovNodeServiceResponse)
async def create_gov_node_service(service: gov_node_services_schema.GovNodeServiceCreate, db: Session = Depends(get_db)):
    db_service = await gov_node_services_crud.create_gov_node_service(db, service)
    if not db_service:
        raise HTTPException(status_code=400, detail="Service creation failed")
    return db_service

@router.get("/{gov_node_id}", response_model=List[gov_node_services_schema.GovNodeServiceResponse])
async def get_gov_node_services(gov_node_id: int, db: Session = Depends(get_db)):
    db_services = await gov_node_services_crud.get_gov_node_services(db, gov_node_id)
    if not db_services:
        raise HTTPException(status_code=404, detail="No services found")
    return db_services

@router.put("/{service_id}", response_model=gov_node_services_schema.GovNodeServiceResponse, dependencies=[Depends(get_current_government_office)])
async def update_gov_node_service(service_id: int, service: gov_node_services_schema.GovNodeServiceUpdate, db: Session = Depends(get_db)):
    db_service = await gov_node_services_crud.update_gov_node_service(db, service_id, service)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.delete("/delete/{service_id}", response_model=gov_node_services_schema.GovNodeServiceResponse, dependencies=[Depends(get_current_government_office)])
async def delete_gov_node_service(service_id: int, db: Session = Depends(get_db)):
    db_service = await gov_node_services_crud.delete_gov_node_service(db, service_id)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service
