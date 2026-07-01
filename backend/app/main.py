from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import Base, engine
from app.api import auth
import app.models  # noqa: F401 - registers all model classes on Base before create_all

# Dev convenience: create tables on startup if they don't exist yet.
# Swap for Alembic migrations once the schema starts changing often.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Finance Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "Finance Tracker API"}


@app.get("/health")
def health():
    return {"status": "ok"}