from app.schemas import gov_node_services_schema
from app.models import gov_node_services_model
from sqlalchemy.orm import Session
from typing import Optional, List
from fastapi import HTTPException
from app.utils.logger import logger
from datetime import datetime

async def create_gov_node_service(db: Session, service: gov_node_services_schema.GovNodeServiceCreate) -> Optional[gov_node_services_schema.GovNodeServiceResponse]:
    try:
        db_service = gov_node_services_model.GovNodeService(
            gov_node_id=service.gov_node_id,
            service_type=service.service_type,
            service_name_si=service.service_name_si,
            service_name_en=service.service_name_en,
            service_name_ta=service.service_name_ta,
            description_si=service.description_si,
            description_en=service.description_en,
            description_ta=service.description_ta,
            created_at=service.created_at,
            updated_at=service.updated_at,
            is_active=service.is_active,
            required_document_types=service.required_document_types
        )

        db.add(db_service)
        db.commit()
        db.refresh(db_service)
        return gov_node_services_schema.GovNodeServiceResponse(
            service_id=db_service.service_id,
            gov_node_id=db_service.gov_node_id,
            service_type=db_service.service_type,
            service_name_si=db_service.service_name_si,
            service_name_en=db_service.service_name_en,
            service_name_ta=db_service.service_name_ta,
            description_si=db_service.description_si,
            description_en=db_service.description_en,
            description_ta=db_service.description_ta,
            created_at=db_service.created_at,
            updated_at=db_service.updated_at,
            is_active=db_service.is_active,
            required_document_types=db_service.required_document_types
        )
    
    except Exception as e:
        logger.error(f"Error creating government node service: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Service creation failed")
    
async def get_gov_node_services(db: Session, gov_node_id: int) -> List[gov_node_services_schema.GovNodeServiceResponse]:
    try:
        db_services = db.query(gov_node_services_model.GovNodeService).filter(gov_node_services_model.GovNodeService.gov_node_id == gov_node_id).all()
        return [gov_node_services_schema.GovNodeServiceResponse(
            service_id=service.service_id,
            gov_node_id=service.gov_node_id,
            service_type=service.service_type,
            service_name_si=service.service_name_si,
            service_name_en=service.service_name_en,
            service_name_ta=service.service_name_ta,
            description_si=service.description_si,
            description_en=service.description_en,
            description_ta=service.description_ta,
            created_at=service.created_at,
            updated_at=service.updated_at,
            is_active=service.is_active,
            required_document_types=service.required_document_types
        ) for service in db_services]
    
    except Exception as e:
        logger.error(f"Error fetching government node services: {e}")
        raise HTTPException(status_code=500, detail="Service retrieval failed")

async def update_gov_node_service(db: Session, service_id: int, service: gov_node_services_schema.GovNodeServiceUpdate) -> Optional[gov_node_services_schema.GovNodeServiceResponse]:
    try:
        db_service = db.query(gov_node_services_model.GovNodeService).filter(gov_node_services_model.GovNodeService.service_id == service_id).first()
        if not db_service:
            raise HTTPException(status_code=404, detail="Service not found")

        for key, value in service.model_dump().items():
            setattr(db_service, key, value)

        db.commit()
        db.refresh(db_service)
        return gov_node_services_schema.GovNodeServiceResponse(
            service_id=db_service.service_id,
            gov_node_id=db_service.gov_node_id,
            service_type=db_service.service_type,
            service_name_si=db_service.service_name_si,
            service_name_en=db_service.service_name_en,
            service_name_ta=db_service.service_name_ta,
            description_si=db_service.description_si,
            description_en=db_service.description_en,
            description_ta=db_service.description_ta,
            created_at=db_service.created_at,
            updated_at=db_service.updated_at,
            is_active=db_service.is_active,
            required_document_types=db_service.required_document_types
        )
    
    except HTTPException as error:
        logger.error(f"Error updating government node service: {error.detail}")
        raise error

    except Exception as e:
        logger.error(f"Error updating government node service: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Service update failed")

async def delete_gov_node_service(db: Session, service_id: int) -> Optional[gov_node_services_schema.GovNodeServiceResponse]:
    try:
        db_service = db.query(gov_node_services_model.GovNodeService).filter(gov_node_services_model.GovNodeService.service_id == service_id).first()
        if not db_service:
            raise HTTPException(status_code=404, detail="Service not found")

        db.delete(db_service)
        db.commit()
        return gov_node_services_schema.GovNodeServiceResponse(
            service_id=db_service.service_id,
            gov_node_id=db_service.gov_node_id,
            service_type=db_service.service_type,
            service_name_si=db_service.service_name_si,
            service_name_en=db_service.service_name_en,
            service_name_ta=db_service.service_name_ta,
            description_si=db_service.description_si,
            description_en=db_service.description_en,
            description_ta=db_service.description_ta,
            created_at=db_service.created_at,
            updated_at=db_service.updated_at,
            is_active=db_service.is_active,
            required_document_types=db_service.required_document_types
        )

    except HTTPException as error:
        logger.error(f"Error deleting government node service: {error.detail}")
        raise error

    except Exception as e:
        logger.error(f"Error deleting government node service: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Service deletion failed")
