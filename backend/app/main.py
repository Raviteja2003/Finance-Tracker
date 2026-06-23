"""
FastAPI application entrypoint.

Phase 1: wires up CORS, DB table creation on startup, and the auth + accounts
routers. Additional routers (transactions, categories, budgets, analytics,
chatbot) are mounted here as each phase is built.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.api import auth, accounts  # noqa: F401  (transactions, categories,
# budgets, analytics, chatbot routers will be added in later phases)

app = FastAPI(title="Finance Tracker API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to the deployed frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    # Tables are auto-created on startup (matches the AI Job Assistant pattern).
    # New columns added later require a manual ALTER TABLE.
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
