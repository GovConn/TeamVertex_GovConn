from typing import List
from app.db.session import get_db
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Depends
from app.crud import blob_crud
from app.schemas import blob_schema, response_schema
from app.utils.token import TokenWithUser
from app.utils.token import create_access_token
from datetime import timedelta

router = APIRouter(
    prefix="/api/v1/blob",
    tags=["Blob"],
)

# this endpoint use to upload the blob and return the link
@router.post("/upload", response_model=blob_schema.BlobResponse)
async def upload_blob(
    blob: blob_schema.BlobCreate,
):
    db_blob = await blob_crud.create_blob(blob)
    if not db_blob:
        raise HTTPException(status_code=400, detail="Failed to upload blob")
    return db_blob
