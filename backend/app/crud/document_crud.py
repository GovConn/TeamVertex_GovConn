from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.document_types_model import DocumentType
from app.schemas.document_types_schema import DocumentTypeBase, DocumentTypeCreate

async def create_document(document_data: DocumentTypeCreate, db: Session) -> DocumentTypeBase:
    try:
        new_doc = DocumentType(
            type_si=document_data.name_si,
            type_en=document_data.name_en,
            type_ta=document_data.name_ta,
            description_si=document_data.description_si,
            description_en=document_data.description_en,
            description_ta=document_data.description_ta
        )
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)
        return DocumentTypeBase(
            id=new_doc.id,
            name_si=new_doc.type_si,
            name_en=new_doc.type_en,
            name_ta=new_doc.type_ta,
            description_si=new_doc.description_si,
            description_en=new_doc.description_en,
            description_ta=new_doc.description_ta,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating document: {str(e)}")

async def get_document_by_id(document_id: int, db: Session) -> DocumentTypeBase:
    try:
        doc = db.query(DocumentType).filter_by(id=document_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        return DocumentTypeBase(
            id=doc.id,
            name_si=doc.type_si,
            name_en=doc.type_en,
            name_ta=doc.type_ta,
            description_si=doc.description_si,
            description_en=doc.description_en,
            description_ta=doc.description_ta,
        )
    
    except HTTPException as error:
        raise error

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching document: {str(e)}")

async def get_all_documents(db: Session) -> list[DocumentTypeBase]:
    try:
        docs = db.query(DocumentType).all()
        return [
            DocumentTypeBase(
                id=doc.id,
                name_si=doc.type_si,
                name_en=doc.type_en,
                name_ta=doc.type_ta,
                description_si=doc.description_si,
                description_en=doc.description_en,
                description_ta=doc.description_ta,
            ) for doc in docs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching documents: {str(e)}")
