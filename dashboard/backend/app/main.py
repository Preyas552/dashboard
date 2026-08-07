from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, containers, schedules
from app.core.config import ALLOWED_ORIGINS
from app.core.scheduler import load_all_jobs, scheduler
from app.db import Base, engine
from app.models import schedule as schedule_model  # noqa: F401 registers the table with Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    load_all_jobs()
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="Homelab Control Plane", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(containers.router)
app.include_router(schedules.router)


@app.get("/health")
def health():
    return {"status": "ok"}
