from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.service_ratings_model import ServiceRating
from app.schemas.service_rating_schema import ServiceRatingCreate, ServiceRatingUpdate, ServiceRatingResponse

async def create_service_rating(rating_data: ServiceRatingCreate, db: Session) -> ServiceRatingResponse:
    try:
        new_rating = ServiceRating(
            service_id=rating_data.service_id,
            service_node_id=rating_data.service_node_id,
            rating=rating_data.rating,
            comment=rating_data.comment,
            created_at=rating_data.created_at
        )
        db.add(new_rating)
        db.commit()
        db.refresh(new_rating)
        return ServiceRatingResponse(
            rating_id=new_rating.rating_id,
            service_id=new_rating.service_id,
            service_node_id=new_rating.service_node_id,
            rating=new_rating.rating,
            comment=new_rating.comment,
            created_at=new_rating.created_at
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating service rating: {str(e)}")

async def get_service_rating(rating_id: int, db: Session) -> ServiceRatingResponse:
    try:
        rating = db.query(ServiceRating).filter_by(rating_id=rating_id).first()
        if not rating:
            raise HTTPException(status_code=404, detail="Service rating not found")
        return ServiceRatingResponse(
            rating_id=rating.rating_id,
            service_id=rating.service_id,
            service_node_id=rating.service_node_id,
            rating=rating.rating,
            comment=rating.comment,
            created_at=rating.created_at
        )
    
    except HTTPException as error:
        raise error
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching service rating: {str(e)}")

async def update_service_rating(rating_id: int, update_data: ServiceRatingUpdate, db: Session) -> ServiceRatingResponse:
    try:
        rating = db.query(ServiceRating).filter_by(rating_id=rating_id).first()
        if not rating:
            raise HTTPException(status_code=404, detail="Service rating not found")
        
        rating.rating = update_data.rating
        rating.comment = update_data.comment
        db.commit()
        db.refresh(rating)
        return ServiceRatingResponse(
            rating_id=rating.rating_id,
            service_id=rating.service_id,
            service_node_id=rating.service_node_id,
            rating=rating.rating,
            comment=rating.comment,
            created_at=rating.created_at
        )
    
    except HTTPException as error:
        raise error

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating service rating: {str(e)}")

async def list_service_ratings(service_id: int, db: Session) -> list[ServiceRatingResponse]:
    try:
        ratings = db.query(ServiceRating).filter_by(service_id=service_id).all()
        return [ServiceRatingResponse(
            rating_id=r.rating_id,
            service_id=r.service_id,
            service_node_id=r.service_node_id,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at
        ) for r in ratings]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing service ratings: {str(e)}")
    
async def list_service_ratings_by_node(service_node_id: int, db: Session) -> list[ServiceRatingResponse]:
    try:
        ratings = db.query(ServiceRating).filter_by(service_node_id=service_node_id).all()
        return [ServiceRatingResponse(
            rating_id=r.rating_id,
            service_id=r.service_id,
            service_node_id=r.service_node_id,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at
        ) for r in ratings]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing service ratings by node: {str(e)}")