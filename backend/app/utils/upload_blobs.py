import os
from app.core.config import blob_service_client
from azure.storage.blob import BlobServiceClient, ContainerClient, BlobBlock, BlobClient, StandardBlobTier, ContentSettings


def upload_blob_file(blob_service_client: BlobServiceClient, container_name: str):
    container_client = blob_service_client.get_container_client(container=container_name)
    with open(file=os.path.join('data', 'toastmasters.pdf'), mode="rb") as data:
        container_client.upload_blob(
            name="toastmasters", data=data,
            overwrite=True,
            content_settings=ContentSettings(content_type='application/pdf')
        )

# recieve file as base64 string convert it and upload
