from fastapi import APIRouter, Depends, Response

from app.database.db import get_database
from app.schemas.auth import LoginRequest
from app.services import admin_auth as admin_auth_service
from app.utils.dependencies import get_current_admin
from app.utils.security import ADMIN_COOKIE, cookie_options, create_token

router = APIRouter(prefix="/api/admin/auth", tags=["Admin Auth"])


@router.post("/login")
async def login(body: LoginRequest, response: Response, db=Depends(get_database)):
    admin = await admin_auth_service.login(db, body.email, body.password)
    response.set_cookie(ADMIN_COOKIE, create_token(admin["id"], kind="admin"), **cookie_options())
    return admin


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(ADMIN_COOKIE, path="/")
    return {"message": "Signed out"}


@router.get("/me")
async def me(admin=Depends(get_current_admin)):
    return admin
