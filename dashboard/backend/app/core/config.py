import os

from dotenv import load_dotenv

load_dotenv()

ADMIN_USERNAME = os.environ["ADMIN_USERNAME"]
ADMIN_PASSWORD_HASH = os.environ["ADMIN_PASSWORD_HASH"]
SECRET_KEY = os.environ["SECRET_KEY"]
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true").lower() == "true"
DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql+psycopg://dashboard:dashboard@localhost:5433/dashboard"
)
