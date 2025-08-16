from app.schemas import services_schema
from app.models import services_model
from sqlalchemy.orm import Session
from typing import Optional, List
from fastapi import HTTPException
from app.utils.logger import logger

async def get_all_services(db: Session) -> List[services_schema.ServiceResponse]:
    """
    Retrieve all services from the database.
    """
    try:
        services = db.query(services_model.GovServiceCategory).all()
        if not services:
            raise HTTPException(status_code=404, detail="No services found")
        return [services_schema.ServiceResponse.model_validate(service) for service in services]

    except HTTPException as error:
        logger.error(f"Error retrieving services: {error.detail}")
        raise error

    except Exception as e:
        logger.error(f"Error retrieving services: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
async def create_service(service: services_schema.ServiceCreate, db: Session) -> Optional[services_schema.ServiceResponse]:
    """
    Create a new service in the database.
    """
    try:
        new_service = services_model.GovServiceCategory(**service.model_dump())
        db.add(new_service)
        db.commit()
        db.refresh(new_service)
        return services_schema.ServiceResponse.model_validate(new_service)
    except Exception as e:
        logger.error(f"Error creating service: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
