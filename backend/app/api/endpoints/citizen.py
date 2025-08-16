from typing import List
from app.db.session import get_db
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.crud import citizen_crud
from app.schemas import citizen_schema, registration_schema, response_schema
from app.utils.token import TokenWithUser, TokenWithCitizen
from app.utils.token import create_access_token
from datetime import timedelta
from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(
    prefix="/api/v1/citizen",
    tags=["Citizen"],
)

# create tempory registration for the citizen
@router.post("/register", response_model=registration_schema.RegistrationResponse)
async def create_citizen_registration(
    registration: registration_schema.RegistrationCreate,
    db: Session = Depends(get_db)
):
    db_citizen = await citizen_crud.create_citizen_registration(db, registration)
    if not db_citizen:
        raise HTTPException(status_code=400, detail="Citizen registration failed")
    return db_citizen

# login to get JWT token
@router.post("/login", response_model=TokenWithCitizen)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login for citizens.
    """
    try:
        citizen = citizen_schema.CitizenLogin(nic=form_data.username, password=form_data.password)
        citizen = await citizen_crud.authenticate_citizen(citizen, db)

        # generate JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": citizen.nic}, expires_delta=access_token_expires
        )

        return TokenWithCitizen(
            access_token=access_token,
            token_type="bearer",
            **citizen.model_dump()
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
@router.put("/reset_password", response_model=citizen_schema.CitizenResponse)
async def reset_password(
    citizen: citizen_schema.CitizenUpdate,
    db: Session = Depends(get_db)
):
    db_citizen = await citizen_crud.reset_password(citizen, db)
    if not db_citizen:
        raise HTTPException(status_code=400, detail="Citizen update failed")
    return db_citizen

@router.put("/update/document_links", response_model=citizen_schema.CitizenResponse)
async def update_citizen_document_links(
    citizen: citizen_schema.CitizenUpdateDocumentLinks,
    db: Session = Depends(get_db)
):
    db_citizen = await citizen_crud.update_citizen_document_links(citizen, db)
    if not db_citizen:
        raise HTTPException(status_code=400, detail="Citizen document links update failed")
    return db_citizen

@router.get("/{nic}", response_model=citizen_schema.CitizenResponse)
async def get_citizen(
    nic: str,
    db: Session = Depends(get_db)
):
    db_citizen = await citizen_crud.get_citizen_by_nic(nic, db)
    if not db_citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")
    return db_citizen