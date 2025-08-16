from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.schemas.gov_schema import GovNodeResponse
from app.schemas.citizen_schema import CitizenResponse
from app.crud import gov_crud, citizen_crud
from app.utils.token import decode_access_token
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.utils.logger import logger

# tokenUrl is the endpoint to get the token
oauth2_scheme_gov = OAuth2PasswordBearer(tokenUrl="/api/v1/gov/login")
oauth2_scheme_citizen = OAuth2PasswordBearer(tokenUrl="/api/v1/citizen/login")

async def get_current_government_office(token: str = Depends(oauth2_scheme_gov), db: Session = Depends(get_db)) -> GovNodeResponse:
    """
    Retrieve the current government office from the token.
    """
    try:
        payload = decode_access_token(token)
        gov_office_id = int(payload.get("sub"))  # "sub" is typically used for the subject (user ID or username)
        if gov_office_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        gov_office = await gov_crud.get_gov_office_by_id(gov_office_id, db)
        if not gov_office:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return gov_office
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

async def get_current_citizen(token: str = Depends(oauth2_scheme_citizen), db: Session = Depends(get_db)) -> CitizenResponse:
    try:
        payload = decode_access_token(token)
        nic = payload.get("sub")
        if not nic:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        citizen = await citizen_crud.get_citizen_by_nic(nic, db)
        if not citizen:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return citizen
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


async def admin_required(current_gov_office: GovNodeResponse = Depends(get_current_government_office)):
    """
    Dependency to ensure the current government office is an admin.
    """
    if current_gov_office.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_gov_office