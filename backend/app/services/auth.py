from fastapi import HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.core.config import get_settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models import User, UserSettings
from app.schemas.auth import DEFAULT_ICON_PACK_BY_LANGUAGE


def set_auth_cookie(response: Response, user: User) -> None:
    settings = get_settings()
    token = create_access_token(user.id)
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.jwt_expires_minutes * 60,
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(
        key=settings.auth_cookie_name,
        path="/",
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        httponly=True,
    )


def get_user_by_login(db: Session, login: str) -> User | None:
    return db.scalar(
        select(User).options(selectinload(User.settings)).where(User.login == login),
    )


def register_user(db: Session, login: str, password: str, language: str) -> User:
    if get_user_by_login(db, login) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Login is already taken",
        )

    user = User(login=login, password_hash=hash_password(password))
    user.settings = UserSettings(
        language=language,
        icon_pack=DEFAULT_ICON_PACK_BY_LANGUAGE[language],
    )
    db.add(user)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Login is already taken",
        ) from exc

    db.refresh(user)
    return get_user_by_login(db, login) or user


def authenticate_user(db: Session, login: str, password: str) -> User:
    user = get_user_by_login(db, login)
    if user is None or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid login or password",
        )
    return user


def change_user_password(db: Session, user: User, new_password: str) -> None:
    user.password_hash = hash_password(new_password)
    db.add(user)
    db.commit()


def update_user_settings(db: Session, user: User, language: str, icon_pack: str) -> User:
    user.settings.language = language
    user.settings.icon_pack = icon_pack
    db.add(user.settings)
    db.commit()
    db.refresh(user.settings)
    return get_user_by_login(db, user.login) or user
