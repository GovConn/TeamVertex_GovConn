from app.schemas import citizen_schema, registration_schema, response_schema, notification_schema
from app.models import registration_model, citizen_model, notification_model
from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import Optional, List
from app.utils.hashing import hash_password, verify_password
from app.utils.send_emails import send, get_temporary_password_email_html, get_password_change_email_html
from app.utils.password_generator import generate_temp_password
from app.utils.document_serializer import serialize_document_links, deserialize_document_links
from app.utils.logger import logger
from datetime import datetime

async def create_citizen_registration(
    db: Session, registration: registration_schema.RegistrationCreate
) -> Optional[registration_schema.RegistrationResponse]:
    """
    Create a temporary registration for a citizen.
    """
    try:
        # Convert the list of DocumentJsonDict to dicts
        # document_links_dicts = []
        # for doc in registration.document_links:
        #     doc_dict = doc.model_dump()
        #     # Convert datetime to ISO formatted string
        #     if 'uploaded_at' in doc_dict and isinstance(doc_dict['uploaded_at'], datetime):
        #         doc_dict['uploaded_at'] = doc_dict['uploaded_at'].isoformat()
        #     document_links_dicts.append(doc_dict)

        document_links_dicts = serialize_document_links(registration.document_links)

        new_registration = registration_model.Registration(
            nic=registration.nic,
            first_name=registration.first_name,
            last_name=registration.last_name,
            email=registration.email,
            phone=registration.phone,
            document_links=document_links_dicts,
        )
        db.add(new_registration)
        db.commit()
        db.refresh(new_registration)

        # Reconstruct Pydantic models for the response
        # document_links_response = []
        # for doc in new_registration.document_links:
        #     if 'uploaded_at' in doc and isinstance(doc['uploaded_at'], str):
        #         # Convert ISO string back to datetime object if needed
        #         doc['uploaded_at'] = datetime.fromisoformat(doc['uploaded_at'])
        #     document_links_response.append(
        #         registration_schema.DocumentJsonDict(**doc)
        #     )

        document_links_response = serialize_document_links(new_registration.document_links)

        notification = notification_model.Notification(
            nic=new_registration.nic,
            message="Your registration has been completed successfully.",
            status="approved",
            created_at=datetime.now()
        )
        db.add(notification)
        db.commit()

        return registration_schema.RegistrationResponse(
            reference_id=new_registration.reference_id,
            nic=new_registration.nic,
            first_name=new_registration.first_name,
            last_name=new_registration.last_name,
            email=new_registration.email,
            phone=new_registration.phone,
            role=new_registration.role,
            active=new_registration.active,
            document_links=document_links_response,
            created_at=new_registration.created_at
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating citizen registration: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def authenticate_citizen(
    citizen: citizen_schema.CitizenLogin, db: Session
) -> Optional[citizen_schema.CitizenResponse]:
    """
    Authenticate a citizen and return their information.
    """
    try:
        db_citizen = db.query(citizen_model.Citizen).filter(
            citizen_model.Citizen.nic == citizen.nic
        ).first()

        if not db_citizen:
            logger.error("Citizen not found")
            raise HTTPException(status_code=404, detail="Citizen not found")

        if not verify_password(citizen.password, db_citizen.password):
            logger.error("Invalid password")
            raise HTTPException(status_code=401, detail="Invalid credentials")

        document_links_response = serialize_document_links(db_citizen.document_links)

        notification = notification_model.Notification(
            nic=db_citizen.nic,
            message="You have successfully logged in.",
            status="approved",
            created_at=datetime.now()
        )
        db.add(notification)
        db.commit()

        return citizen_schema.CitizenResponse(
            id=db_citizen.id,
            nic=db_citizen.nic,
            first_name=db_citizen.first_name,
            last_name=db_citizen.last_name,
            email=db_citizen.email,
            phone=db_citizen.phone,
            role=db_citizen.role,
            active=db_citizen.active,
            document_links=document_links_response,
            created_at=db_citizen.created_at
        )

    except HTTPException as error:
        raise error

    except Exception as e:
        logger.error(f"Error authenticating citizen: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def get_citizen_by_nic(nic: str, db: Session) -> Optional[citizen_schema.CitizenResponse]:
    """
    Get a citizen by their NIC.
    """
    try:
        db_citizen = db.query(citizen_model.Citizen).filter(
            citizen_model.Citizen.nic == nic
        ).first()

        if not db_citizen:
            logger.error("Citizen not found")
            raise HTTPException(status_code=404, detail="Citizen not found")

        document_links_response = serialize_document_links(db_citizen.document_links)

        return citizen_schema.CitizenResponse(
            id=db_citizen.id,
            nic=db_citizen.nic,
            first_name=db_citizen.first_name,
            last_name=db_citizen.last_name,
            email=db_citizen.email,
            phone=db_citizen.phone,
            role=db_citizen.role,
            active=db_citizen.active,
            document_links=document_links_response,
            created_at=db_citizen.created_at
        )
    
    except HTTPException as error:
        raise error

    except Exception as e:
        logger.error(f"Error getting citizen by NIC: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def create_citizen_account(
    citizen: citizen_schema.CitizenCreate, db: Session
) -> Optional[citizen_schema.CitizenResponse]:
    """
    Create a new citizen account.
    """
    try:
        temp_password = generate_temp_password()
        hashed_password = hash_password(temp_password)

        # for debug
        logger.debug(f"Temporary password for {citizen.nic}: {temp_password}")

        html_content = get_temporary_password_email_html(
            recipient_name=f"{citizen.first_name} {citizen.last_name}",
            temp_password=temp_password
        )

        # Serialize document_links before saving
        serialized_links = serialize_document_links(citizen.document_links)

        new_citizen = citizen_model.Citizen(
            nic=citizen.nic,
            first_name=citizen.first_name,
            last_name=citizen.last_name,
            email=citizen.email,
            phone=citizen.phone,
            password=hashed_password,
            active=citizen.active,
            document_links=serialized_links
        )
        db.add(new_citizen)
        db.commit()
        db.refresh(new_citizen)

        notification = notification_model.Notification(
            nic=new_citizen.nic,
            message="Your account has been created successfully. Please check your email for the temporary password.",
            status="approved",
            created_at=datetime.now()
        )
        db.add(notification)
        db.commit()

        logger.info(f"Citizen account created for NIC: {new_citizen.nic}")

        send(
            sender_name="GovConn Support",
            recipient_email=new_citizen.email,
            recipient_name=f"{new_citizen.first_name} {new_citizen.last_name}",
            subject="Your Temporary Password",
            html_content=html_content
        )

        return citizen_schema.CitizenResponse(
            id=new_citizen.id,
            nic=new_citizen.nic,
            first_name=new_citizen.first_name,
            last_name=new_citizen.last_name,
            email=new_citizen.email,
            phone=new_citizen.phone,
            role=new_citizen.role,
            active=new_citizen.active,
            document_links=serialize_document_links(new_citizen.document_links),
            created_at=new_citizen.created_at
        )
    except Exception as e:
        logger.error(f"Error creating citizen account: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    

async def reset_password(
    citizen: citizen_schema.CitizenUpdate, db: Session
) -> Optional[citizen_schema.CitizenResponse]:
    """
    Update an existing citizen.
    """
    try:
        db_citizen = db.query(citizen_model.Citizen).filter(citizen_model.Citizen.nic == citizen.nic).first()
        if not db_citizen:
            logger.error("Citizen not found")
            raise HTTPException(status_code=404, detail="Citizen not found")

        # Update citizen fields
        db_citizen.password = hash_password(citizen.password)

        db.commit()
        db.refresh(db_citizen)

        html_content = get_password_change_email_html(
            recipient_name=f"{db_citizen.first_name} {db_citizen.last_name}",
        )

        send(
            sender_name="GovConn Support",
            recipient_email=db_citizen.email,
            recipient_name=f"{db_citizen.first_name} {db_citizen.last_name}",
            subject="Your Password Has Been Reset",
            html_content=html_content
        )

        notification = notification_model.Notification(
            nic=db_citizen.nic,
            message="Your password has been reset successfully.",
            status="approved",
            created_at=datetime.now()
        )
        db.add(notification)
        db.commit()

        return citizen_schema.CitizenResponse(
            id=db_citizen.id,
            nic=db_citizen.nic,
            first_name=db_citizen.first_name,
            last_name=db_citizen.last_name,
            email=db_citizen.email,
            phone=db_citizen.phone,
            role=db_citizen.role,
            active=db_citizen.active,
            document_links=serialize_document_links(db_citizen.document_links),
            created_at=db_citizen.created_at
        )
    
    except HTTPException as error:
        logger.error(f"Error updating citizen: {error.detail}")
        raise error

    except Exception as e:
        logger.error(f"Error updating citizen: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def update_citizen_document_links(
    citizen: citizen_schema.CitizenUpdateDocumentLinks, db: Session
) -> Optional[citizen_schema.CitizenResponse]:
    """
    Update the document links of an existing citizen.
    """
    try:
        db_citizen = db.query(citizen_model.Citizen).filter(citizen_model.Citizen.nic == citizen.nic).first()
        if not db_citizen:
            logger.error("Citizen not found")
            raise HTTPException(status_code=404, detail="Citizen not found")

        # Update document links
        db_citizen.document_links = serialize_document_links(citizen.document_links)

        db.commit()
        db.refresh(db_citizen)

        notification = notification_model.Notification(
            nic=db_citizen.nic,
            message="Your document links have been updated successfully.",
            status="approved",
            created_at=datetime.now()
        )
        db.add(notification)
        db.commit()

        return citizen_schema.CitizenResponse(
            id=db_citizen.id,
            nic=db_citizen.nic,
            first_name=db_citizen.first_name,
            last_name=db_citizen.last_name,
            email=db_citizen.email,
            phone=db_citizen.phone,
            role=db_citizen.role,
            active=db_citizen.active,
            document_links=serialize_document_links(db_citizen.document_links),
            created_at=db_citizen.created_at
        )

    except HTTPException as error:
        logger.error(f"Error updating citizen: {error.detail}")
        raise error

    except Exception as e:
        logger.error(f"Error updating citizen: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")