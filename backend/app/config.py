"""
Application settings, loaded from environment variables (injected via Docker
Compose locally, or via GitHub Environment secrets / Render env vars in
production). No .env file is read in CI or in production containers.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_days: int = 7
    gemini_api_key: str

    class Config:
        env_file = ".env"  # only used for local development


settings = Settings()
