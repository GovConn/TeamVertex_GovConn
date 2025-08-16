from sqlalchemy.orm import sessionmaker, scoped_session
from app.db.db import connect_with_connector

# create the engine
engine = connect_with_connector()

# create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# create a scoped session
Session = scoped_session(SessionLocal)

def get_db():
    """
    Dependency that provides a database session.
    """
    db = Session()
    try:
        yield db
    finally:
        db.close()
