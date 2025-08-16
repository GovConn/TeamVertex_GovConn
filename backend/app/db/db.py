import sqlalchemy
from sqlalchemy import create_engine
from app.core.config import DB_HOST, DB_PASSWORD, DB_USER, DB_NAME

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}?sslmode=require"

# engine = create_engine(DATABASE_URL, echo=True)

# Test the connection
# try:
#     with engine.connect() as connection:
#         print("Connection successful!")
# except Exception as e:
#     print(f"Failed to connect: {e}")

def connect_with_connector() -> sqlalchemy.engine.base.Engine:
    """
    Connect to the database using the connector.
    """
    # Create a connection to the database
    engine = create_engine(DATABASE_URL)
    return engine

