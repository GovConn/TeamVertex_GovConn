from fastapi import APIRouter, status
from app.utils.vectorize import setup_vector_store


router = APIRouter(
    prefix="/training",
    tags=["Setting up vector databases"],
)

data_path = './data/govconn'
store_path = './db/govconn'


@router.get("/setup_vector_db", status_code=status.HTTP_200_OK)
async def setup_vector_db():
    """Set up the GovConn vector database."""
    setup_vector_store(data_path, store_path)
    return {"message": "GovConn vector database setup complete."}


