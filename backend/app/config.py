from pydantic_settings import BaseSettings, SettingsConfigDict

""""
    Base Settings is a class provided by the pydantic-settings library 
    It automatically : 
        1)Reads values from environment variables and .env files
        2)Validate their types according to their feild annotations
        3)Convert them into proper python objects(eg int, float, list, dict etc)
"""
class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Comma-separated list in .env, e.g. "http://localhost:3000,http://localhost:5173"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    """ 
        This is pydantic v2 syntax for specifying settings for the Settings class itself. In this case, we specify that the .env file should be used to load environment variables, and that any extra environment variables not defined in the Settings class should be ignored (rather than raising an error).
        For v1, this has to be done with a Config class inside the Settings class
        class Config:
            env_file = ".env"
    """
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    """ 
        @property is used when we want to define a method that can be accessed like an attribute.
        In this case, we want to convert the comma-separated string of CORS origins into a list of strings, which is more convenient for use in the FastAPI middleware configuration.
    """
    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

"""
    Object of the Settings class is created and stored in the settings variable. 
    This object will be used throughout the application to access configuration values.
"""
settings = Settings()