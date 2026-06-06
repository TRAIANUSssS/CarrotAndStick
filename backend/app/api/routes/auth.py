from fastapi import APIRouter, Response, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.auth import AuthResponse, ChangePasswordRequest, LoginRequest, RegisterRequest
from app.services.auth import (
    authenticate_user,
    change_user_password,
    clear_auth_cookie,
    register_user,
    set_auth_cookie,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, response: Response, db: DbSession) -> AuthResponse:
    user = register_user(db, payload.login, payload.password, payload.language)
    set_auth_cookie(response, user)
    return AuthResponse(user=user, settings=user.settings)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, db: DbSession) -> AuthResponse:
    user = authenticate_user(db, payload.login, payload.password)
    set_auth_cookie(response, user)
    return AuthResponse(user=user, settings=user.settings)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> Response:
    clear_auth_cookie(response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/me", response_model=AuthResponse)
def me(current_user: CurrentUser) -> AuthResponse:
    return AuthResponse(user=current_user, settings=current_user.settings)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(payload: ChangePasswordRequest, current_user: CurrentUser, db: DbSession) -> Response:
    change_user_password(db, current_user, payload.old_password, payload.new_password)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
