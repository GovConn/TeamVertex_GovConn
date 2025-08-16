from app.schemas import gov_schema, response_schema, citizen_schema, registration_schema
from app.models import gov_model, registration_model
from app.crud.citizen_crud import create_citizen_account
from sqlalchemy.orm import Session
from typing import Optional, List
from fastapi import HTTPException
from app.utils.hashing import hash_password, verify_password
from app.utils.document_serializer import serialize_document_links
from app.utils.logger import logger
from datetime import datetime

async def get_all_gov_offices(category_id: None | str, db: Session) -> List[gov_schema.GovNodeResponse]:
    """
    Retrieve all government offices from the database.
    """
    try:
        if category_id:
            offices = db.query(gov_model.GovNode).filter(gov_model.GovNode.category_id == category_id).all()
        else:
            offices = db.query(gov_model.GovNode).all()
        if not offices:
            return []
        
        return [gov_schema.GovNodeResponse(
            id=office.id,
            email=office.email,
            username=office.username,
            location=office.location,
            category_id=office.category_id,
            name_si=office.name_si,
            name_en=office.name_en,
            name_ta=office.name_ta,
            role=office.role,
            description_si=office.description_si,
            description_en=office.description_en,
            description_ta=office.description_ta,
            created_at=office.created_at,
        ) for office in offices]
    except Exception as e:
        logger.error(f"Error retrieving government offices: {e}")
        return []
    
async def activate_user_account(reference_id: str, db: Session) -> Optional[response_schema.ResponseMsg]:
    """
    Activate a user account.
    """
    try:
        user = db.query(registration_model.Registration).filter(registration_model.Registration.reference_id == reference_id).first()
        if not user:
            return None
        user.active = True
        db.commit()

        document_links_models = [
            citizen_schema.DocumentJsonDict(
                title=doc['title'],
                url=doc['url'],
                uploaded_at=datetime.fromisoformat(doc['uploaded_at'])
            )
            for doc in user.document_links
        ]

        new_citizen = citizen_schema.CitizenCreate(
            nic=user.nic,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            password="password",
            phone=user.phone,
            role="user",
            active=True,
            document_links=document_links_models,
        )

        await create_citizen_account(new_citizen, db)

        return response_schema.ResponseMsg(message="User account activated successfully")
    except Exception as e:
        logger.error(f"Error activating user account: {e}")
        return None
    
async def authenticate_gov_office(gov_office: gov_schema.GovLogin, db: Session) -> Optional[gov_schema.GovNodeResponse]:
    """
    Authenticate a government office.
    """
    try:
        user = db.query(gov_model.GovNode).filter(gov_model.GovNode.email == gov_office.email).first()
        if not user:
            logger.error("Government office not found")
            raise HTTPException(status_code=404, detail="Government office not found")
        if not verify_password(gov_office.password, user.password):
            logger.error("Invalid password")
            raise HTTPException(status_code=404, detail="Government office email or password is incorrect")
        return gov_schema.GovNodeResponse.model_validate(user)

    except HTTPException as error:
        logger.error(f"Error authenticating government office: {error.detail}")
        raise error

    except Exception as e:
        logger.error(f"Error authenticating government office: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
async def get_gov_office_by_id(gov_office_id: int, db: Session) -> Optional[gov_schema.GovNodeResponse]:
    """
    Retrieve a government office by its ID.
    """
    try:
        user = db.query(gov_model.GovNode).filter(gov_model.GovNode.id == gov_office_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Government office not found")
        return gov_schema.GovNodeResponse.model_validate(user)
    
    except HTTPException as error:
        logger.error(f"Error retrieving government office by ID: {error.detail}")
        raise error

    except Exception as e:
        logger.error(f"Error retrieving government office by ID: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
async def create_gov_office(gov_office: gov_schema.GovNodeCreate, db: Session) -> Optional[gov_schema.GovNodeResponse]:
    """
    Create a new government office.
    """
    try:
        new_office = gov_model.GovNode(
            email=gov_office.email,
            username=gov_office.username,
            password=hash_password(gov_office.password),
            location=gov_office.location,
            category_id=gov_office.category_id,
            name_si=gov_office.name_si,
            name_en=gov_office.name_en,
            name_ta=gov_office.name_ta,
            role=gov_office.role,
            description_si=gov_office.description_si,
            description_en=gov_office.description_en,
            description_ta=gov_office.description_ta
        )
        db.add(new_office)
        db.commit()
        db.refresh(new_office)
        logger.info(f"New government office created: {new_office.id} at {new_office.created_at}")

        return gov_schema.GovNodeResponse.model_validate(new_office)
    except Exception as e:
        logger.error(f"Error creating government office: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


async def get_registration_by_reference_id(reference_id: str, db: Session) -> Optional[registration_schema.RegistrationResponse]:
    """
    Get a registration by its reference ID.
    """
    try:
        db_registration = db.query(registration_model.Registration).filter(
            registration_model.Registration.reference_id == reference_id
        ).first()

        if not db_registration:
            logger.error("Registration not found")
            raise HTTPException(status_code=404, detail="Registration not found")

        document_links_response = serialize_document_links(db_registration.document_links)

        return registration_schema.RegistrationResponse(
            reference_id=db_registration.reference_id,
            nic=db_registration.nic,
            first_name=db_registration.first_name,
            last_name=db_registration.last_name,
            email=db_registration.email,
            phone=db_registration.phone,
            role=db_registration.role,
            active=db_registration.active,
            document_links=document_links_response,
            created_at=db_registration.created_at
        )

    except HTTPException as error:
        raise error

    except Exception as e:
        logger.error(f"Error getting registration by reference ID: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")