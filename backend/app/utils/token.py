import jwt
from datetime import datetime, timedelta
from typing import Optional
from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from pydantic import BaseModel
from app.schemas.gov_schema import GovNodeResponse
from app.schemas.citizen_schema import CitizenResponse

# Define the token schema
class Token(GovNodeResponse):
    access_token: str
    token_type: str

class TokenWithUser(Token):
    pass

class TokenCitizen(CitizenResponse):
    access_token: str
    token_type: str

class TokenWithCitizen(TokenCitizen):
    pass


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """
    Decode a JWT token.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")