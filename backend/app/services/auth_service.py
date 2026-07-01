from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import HTTPException, status
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, Token

# NOTE: bcrypt is called directly here, not via passlib. passlib's bcrypt
# backend breaks on bcrypt>=4.1 (it calls bcrypt.__about__.__version__,
# which was removed) - avoided proactively based on the prior project.


def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None


def register_user(db: Session, payload: UserCreate) -> User:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, payload: UserLogin) -> Token:
    user = db.query(User).filter(User.email == payload.email).first()

    # Same generic error whether the email doesn't exist or the password is
    # wrong - don't leak which one it was.
    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
    )

    if not user or not verify_password(payload.password, user.hashed_password):
        raise invalid_credentials

    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, user=user)