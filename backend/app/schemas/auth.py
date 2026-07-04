""""
    Schemas are pydantic models that define the structure of the data that is sent and received by the API ENDPOINTS. 
    They are used for data validation and serialization, ensurning that the data sent and recieved by the API ednpoints is in the correct format and meets the required constraints.
"""



from datetime import datetime

""" 
    BaseModel is a class provided by pydantic for creating data models. It provides data validation, serialization, and documentation features.
    ConfigDict is a class provided by pydantic for configuring the behavior of BaseModel instances. 
    It allows us to specify how the model should be serialized and deserialized, and how it should handle extra fields that are not defined in the model.
    EmailStr is a class provided by pydantic for validating email addresses. It ensures that the email address is in a valid format and raises a validation error if it is not.
    Field is a class provided by pydantic for defining fields in a data model. It allows us to specify constraints on the field, such as minimum and maximum length, and provides validation and serialization features.
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailStr
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut