from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, containers
from app.core.config import ALLOWED_ORIGINS

app = FastAPI(title="Homelab Control Plane")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(containers.router)


@app.get("/health")
def health():
    return {"status": "ok"}
