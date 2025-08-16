from typing import List
from app.db.session import get_db
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.crud import gov_crud
from app.schemas import gov_schema, response_schema, registration_schema
from app.utils.token import TokenWithUser
from app.utils.token import create_access_token
from app.utils.auth import admin_required
from datetime import timedelta
from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(
    prefix="/api/v1/gov",
    tags=["Government Offices"],
)

# this endpoint use to retrieve all the government offices with categories
@router.get("/offices", response_model=List[gov_schema.GovNodeResponse])
async def get_government_offices(category_id: int = None, db: Session = Depends(get_db)):
    """
    Get a list of all government offices in the specified category.
    """
    offices = await gov_crud.get_all_gov_offices(category_id, db)
    if not offices:
        raise HTTPException(status_code=404, detail="No government offices found")
    return offices

# this endpoint can only accessed by admin govNodes for activate user account
@router.get("/user/activate", response_model=response_schema.ResponseMsg, dependencies=[Depends(admin_required)])
async def activate_user_account(reference_id: str, db: Session = Depends(get_db)):
    """
    Activate a user account.
    """
    result = await gov_crud.activate_user_account(reference_id, db)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result

# this is login endpoint
@router.post("/login", response_model=TokenWithUser)
async def login(formdata: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login for government offices.
    """
    try:
        gov_office = gov_schema.GovLogin(email=formdata.username, password=formdata.password)
        gov_office = await gov_crud.authenticate_gov_office(gov_office, db)

        # generate JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(gov_office.id)}, expires_delta=access_token_expires
        )

        return TokenWithUser(
            access_token=access_token,
            token_type="bearer",
            **gov_office.model_dump()
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
# create government account
@router.post("/register", response_model=gov_schema.GovNodeResponse)
async def create_gov_office(gov_office: gov_schema.GovNodeCreate, db: Session = Depends(get_db)):
    """
    Create a new government office.
    """
    result = await gov_crud.create_gov_office(gov_office, db)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to create government office")
    return result

@router.get("/registrations/{reference_id}", response_model=registration_schema.RegistrationResponse)
async def get_registration(reference_id: str, db: Session = Depends(get_db)):
    """
    Get a government office registration by reference ID.
    """
    result = await gov_crud.get_registration_by_reference_id(reference_id, db)
    if not result:
        raise HTTPException(status_code=404, detail="Registration not found")
    return result