from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

#importing settings object from config.py to access configuration values throughout the application
from app.config import settings

#importing Base and engine from db.py to create database tables on startup
from app.db import Base, engine

from app.api import auth

import app.models
from app.api import accounts
from app.api import transactions
from app.api import categories  # noqa: F401 - registers all model classes on Base before create_all
from app.api import budgets  # noqa: F401 - registers all model classes on Base before create_all

# Dev convenience: create tables on startup if they don't exist yet.
# Swap for Alembic migrations once the schema starts changing often.
Base.metadata.create_all(bind=engine)

"""
    Create FastAPI app instance and configure CORS middleware and API routers
"""
app = FastAPI(title="Finance Tracker API")

"""
    Add CORS middleware to the FastAPI app instance. This allows the API to be accessed from different origins (domains) in a web browser, which is necessary for frontend applications that are served from a different domain than the API.
    The allowed origins are specified in the config file as CROSS_ORIGINS as a comma-separated values, and are converted into a list of strings using the cors_origins_list property of the Settings class.
"""
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(categories.router)
app.include_router(budgets.router)
@app.get("/")
def root():
    return {"message": "Finance Tracker API"}


@app.get("/health")
def health():
    return {"status": "ok"}