import bcrypt
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from app.core.config import ADMIN_PASSWORD_HASH, ADMIN_USERNAME, SECRET_KEY

SESSION_MAX_AGE = 60 * 60 * 24 * 7  # 7 days
_serializer = URLSafeTimedSerializer(SECRET_KEY, salt="session")


def verify_credentials(username: str, password: str) -> bool:
    if username != ADMIN_USERNAME:
        return False
    return bcrypt.checkpw(password.encode(), ADMIN_PASSWORD_HASH.encode())


def create_session_token(username: str) -> str:
    return _serializer.dumps(username)


def verify_session_token(token: str) -> str | None:
    try:
        return _serializer.loads(token, max_age=SESSION_MAX_AGE)
    except (BadSignature, SignatureExpired):
        return None
