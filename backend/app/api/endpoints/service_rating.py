from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.service_rating_schema import ServiceRatingCreate, ServiceRatingUpdate, ServiceRatingResponse
from app.crud import service_rating_crud

router = APIRouter(
    prefix="/api/v1/gov_service_ratings",
    tags=["Service Ratings"]
)

@router.post("/create", response_model=ServiceRatingResponse)
async def create_service_rating(rating_data: ServiceRatingCreate, db: Session = Depends(get_db)):
    return await service_rating_crud.create_service_rating(rating_data, db)

@router.put("/{rating_id}", response_model=ServiceRatingResponse)
async def update_service_rating(rating_id: int, update_data: ServiceRatingUpdate, db: Session = Depends(get_db)):
    return await service_rating_crud.update_service_rating(rating_id, update_data, db)

@router.get("/{rating_id}", response_model=ServiceRatingResponse)
async def get_service_rating(rating_id: int, db: Session = Depends(get_db)):
    return await service_rating_crud.get_service_rating(rating_id, db)

@router.get("/service/{service_id}", response_model=List[ServiceRatingResponse])
async def list_service_ratings(service_id: int, db: Session = Depends(get_db)):
    return await service_rating_crud.list_service_ratings(service_id, db)

@router.get("/service_node/{service_node_id}", response_model=List[ServiceRatingResponse])
async def list_service_ratings_by_node(service_node_id: int, db: Session = Depends(get_db)):
    return await service_rating_crud.list_service_ratings_by_node(service_node_id, db)