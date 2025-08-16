from dotenv import load_dotenv
import os
from azure.identity import ClientSecretCredential
from azure.storage.blob import BlobServiceClient, ContainerClient, BlobBlock, BlobClient, StandardBlobTier, ContentSettings

load_dotenv()

# supabase postgres database credentials
DB_HOST = os.getenv("DB_HOST")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_USER = os.getenv("DB_USER")
DB_NAME = os.getenv("DB_NAME")

# mailjet API keys
MJ_APIKEY_PUBLIC = os.getenv("MJ_APIKEY_PUBLIC")
MJ_APIKEY_PRIVATE = os.getenv("MJ_APIKEY_PRIVATE")

# Secret key for signing the JWT
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

# azure credentials
AZURE_CLIENT_ID = os.getenv("AZURE_CLIENT_ID")
AZURE_CLIENT_SECRET = os.getenv("AZURE_CLIENT_SECRET")
AZURE_TENANT_ID = os.getenv("AZURE_TENANT_ID")
AZURE_BLOB_ACCOUNT_URL = os.getenv("AZURE_BLOB_ACCOUNT_URL")


credential = ClientSecretCredential(
    tenant_id=AZURE_TENANT_ID,
    client_id=AZURE_CLIENT_ID,
    client_secret=AZURE_CLIENT_SECRET
)

# Create the BlobServiceClient object
blob_service_client = BlobServiceClient(AZURE_BLOB_ACCOUNT_URL, credential=credential)

def upload_blob_file(blob_service_client: BlobServiceClient, container_name: str):
    container_client = blob_service_client.get_container_client(container=container_name)
    with open(file=os.path.join('data', 'toastmasters.pdf'), mode="rb") as data:
        container_client.upload_blob(
            name="toastmasters", data=data,
            overwrite=True,
            content_settings=ContentSettings(content_type='application/pdf')
        )

        # Generate the blob URL (make sure your storage account allows public access or generate a SAS if needed)
        url = f"{container_client.url}/toastmasters"  # Adjust as needed
        print(f"Blob uploaded successfully: {url}")

# test file upload
# upload_blob_file(blob_service_client, "uploads")
