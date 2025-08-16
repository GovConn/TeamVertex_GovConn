from datetime import datetime
from typing import List
from app.schemas.citizen_schema import DocumentJsonDict

def serialize_document_links(doc_links):
    serialized = []
    for doc in doc_links or []:
        doc_dict = doc.model_dump() if hasattr(doc, 'model_dump') else doc
        # Convert uploaded_at datetime to ISO string
        if 'uploaded_at' in doc_dict and isinstance(doc_dict['uploaded_at'], datetime):
            doc_dict['uploaded_at'] = doc_dict['uploaded_at'].isoformat()
        serialized.append(doc_dict)
    return serialized


def deserialize_document_links(doc_links_json: List[dict]) -> List[DocumentJsonDict]:
    print(f"Deserializing document links: {doc_links_json}")
    deserialized = []
    for doc in doc_links_json or []:
        if 'uploaded_at' in doc and isinstance(doc['uploaded_at'], str):
            doc['uploaded_at'] = datetime.fromisoformat(doc['uploaded_at'])
        deserialized.append(DocumentJsonDict(**doc))
    print(f"Deserialized document links: {deserialized}")
    return deserialized