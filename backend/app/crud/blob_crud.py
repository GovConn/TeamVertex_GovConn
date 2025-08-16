import base64
from app.schemas import blob_schema, response_schema
from sqlalchemy.orm import Session
from typing import Optional, List
from app.utils.hashing import hash_password, verify_password
from app.utils.logger import logger
from app.core.config import blob_service_client
from azure.storage.blob import ContentSettings
from datetime import datetime

async def create_blob(blob: blob_schema.BlobCreate) -> Optional[blob_schema.BlobResponse]:
    try:
        container_client = blob_service_client.get_container_client(container="uploads")

        # Decode base64 to bytes
        blob_bytes = base64.b64decode(blob.file)

        # Prepare content settings for correct MIME type
        content_settings = ContentSettings(content_type="application/pdf")

        # Upload the file
        container_client.upload_blob(
            name=blob.filename,
            data=blob_bytes,
            overwrite=True,
            content_settings=content_settings
        )

        # Generate the blob URL
        url = f"{container_client.url}/{blob.filename}"

        logger.info(f"Blob {blob.filename} uploaded successfully to {url}")
        
        return blob_schema.BlobResponse(
            filename=blob.filename,
            url=url,
            uploaded_at=datetime.now()
        )

    except Exception as e:
        logger.error(f"Failed to upload blob: {e}")
        return None
    