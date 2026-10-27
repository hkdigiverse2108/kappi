from fastapi import APIRouter, Depends, Response

from app.database.db import get_database
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginOtpRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    VerifyOtpRequest,
)
from app.services import auth as auth_service
from app.utils.dependencies import get_current_user
from app.utils.security import USER_COOKIE, cookie_options, create_token

router = APIRouter(prefix="/api/auth", tags=["Customer Auth"])


def _start_session(response: Response, user: dict) -> dict:
    response.set_cookie(USER_COOKIE, create_token(user["id"], kind="user"), **cookie_options())
    return user


@router.post("/register")
async def register(body: RegisterRequest, db=Depends(get_database)):
    return await auth_service.register(db, body.model_dump())


@router.post("/login")
async def login(body: LoginRequest, db=Depends(get_database)):
    # Step 1: password check, emails a sign-in code
    return await auth_service.login(db, body.email, body.password)


@router.post("/login/verify-otp")
async def verify_login_otp(body: LoginOtpRequest, response: Response, db=Depends(get_database)):
    # Step 2: correct code starts the session
    user = await auth_service.verify_login_otp(db, body.email, body.otp)
    return _start_session(response, user)


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(USER_COOKIE, path="/")
    return {"message": "Signed out"}


@router.get("/me")
async def me(user=Depends(get_current_user)):
    return user


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db=Depends(get_database)):
    return await auth_service.send_reset_otp(db, body.identifier)


@router.post("/verify-otp")
async def verify_otp(body: VerifyOtpRequest, db=Depends(get_database)):
    return await auth_service.verify_reset_otp(db, body.identifier, body.otp)


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db=Depends(get_database)):
    return await auth_service.reset_password(db, body.identifier, body.resetToken, body.password)
