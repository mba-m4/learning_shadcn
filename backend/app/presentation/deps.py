import os

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlmodel import Session

from app.domain.models import User
from app.infrastructure.db import get_session
from app.infrastructure.repositories import SqlModelRepository
from app.infrastructure.security import decode_access_token


SECRET_KEY = os.getenv("SECRET_KEY", "change-me")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_repo(session: Session = Depends(get_session)) -> SqlModelRepository:
    return SqlModelRepository(session)


def get_current_user(token: str = Depends(oauth2_scheme), repo: SqlModelRepository = Depends(get_repo)) -> User:
    try:
        payload = decode_access_token(token, SECRET_KEY)
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = repo.get_user(int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")

    return user
