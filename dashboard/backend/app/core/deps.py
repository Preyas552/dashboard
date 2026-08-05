from fastapi import HTTPException, Request

from app.core.security import verify_session_token


def get_current_user(request: Request) -> str:
    token = request.cookies.get("session")
    username = verify_session_token(token) if token else None
    if username is None:
        raise HTTPException(status_code=401, detail="not authenticated")
    return username
