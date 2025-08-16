from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.document_types_schema import DocumentTypeBase, DocumentTypeCreate
from app.crud import document_crud

router = APIRouter(
    prefix="/api/v1/documents",
    tags=["Documents"]
)

@router.post("/", response_model=DocumentTypeBase, summary="Add a new document type")
async def add_document(document: DocumentTypeCreate, db: Session = Depends(get_db)):
    return await document_crud.create_document(document, db)

@router.get("/{document_id}", response_model=DocumentTypeBase, summary="Get document type by id")
async def get_document_by_id(document_id: int, db: Session = Depends(get_db)):
    return await document_crud.get_document_by_id(document_id, db)

@router.get("/all/", response_model=list[DocumentTypeBase], summary="Get all document types")
async def get_all_documents(db: Session = Depends(get_db)):
    return await document_crud.get_all_documents(db)