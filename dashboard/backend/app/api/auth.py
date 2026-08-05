from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel

from app.core.config import COOKIE_SECURE
from app.core.deps import get_current_user
from app.core.security import create_session_token, verify_credentials

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(body: LoginRequest, response: Response):
    if not verify_credentials(body.username, body.password):
        raise HTTPException(status_code=401, detail="invalid username or password")

    token = create_session_token(body.username)
    response.set_cookie(
        key="session",
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )
    return {"username": body.username}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("session")
    return {"status": "logged out"}


@router.get("/me")
def me(username: str = Depends(get_current_user)):
    return {"username": username}
