from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import get_settings
from app.core.security import decode_access_token
from app.db.session import get_db_session
from app.models import User

DbSession = Annotated[Session, Depends(get_db_session)]


def get_current_user(request: Request, db: DbSession) -> User:
    settings = get_settings()
    token = request.cookies.get(settings.auth_cookie_name)

    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    user = db.scalar(
        select(User).options(selectinload(User.settings)).where(User.id == user_id),
    )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user

CurrentUser = Annotated[User, Depends(get_current_user)]

