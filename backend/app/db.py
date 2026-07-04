from sqlalchemy import create_engine

"""
    ORM is used to let deveopers work with the databases using objects and methods instead of writing raw SQL.
    This file is responsible for setting up the database connection and creating a session for interacting with the database.
"""
from sqlalchemy.orm import sessionmaker, declarative_base

#importing settings object from config.py to access the DATABASE_URL environment variable for creating the database engine
from app.config import settings

#create_engine() is used to create a connection to the database specified by the DATABASE_URL environment variable. The pool_pre_ping=True argument is used to check if the connection is still alive before using it, which helps prevent errors due to dropped connections.
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

#creates a database session for CRUD operations.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


#Base is the base class for all the ORM models in the application. It is used to create the database tables and map them to Python classes.
Base = declarative_base()

"""
    get_db() is a dependency function that provides a database session to the API endpoints.
    It creates a new session, yields it to the endpoint, and then closes the session after the request is completed.
"""
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()