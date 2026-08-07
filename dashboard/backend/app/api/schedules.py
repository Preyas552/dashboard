from datetime import datetime
from typing import Literal

import docker
from apscheduler.triggers.cron import CronTrigger
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.docker_client import get_docker_client
from app.core.scheduler import remove_job, sync_job
from app.db import get_db
from app.models.schedule import Schedule, ScheduleExecution

router = APIRouter(
    prefix="/schedules", tags=["schedules"], dependencies=[Depends(get_current_user)]
)


class ScheduleCreate(BaseModel):
    name: str
    cron_expression: str
    container_id: str
    container_name: str
    action: Literal["start", "stop", "restart"]
    enabled: bool = True


class ScheduleUpdate(BaseModel):
    enabled: bool


class ScheduleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    cron_expression: str
    container_id: str
    container_name: str
    action: str
    enabled: bool
    created_at: datetime


class ExecutionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ran_at: datetime
    success: bool
    message: str


def _validate_cron(expr: str):
    try:
        CronTrigger.from_crontab(expr)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"invalid cron expression: '{expr}'")


@router.get("", response_model=list[ScheduleOut])
def list_schedules(db: Session = Depends(get_db)):
    return db.query(Schedule).order_by(Schedule.created_at.desc()).all()


@router.post("", response_model=ScheduleOut, status_code=201)
def create_schedule(body: ScheduleCreate, db: Session = Depends(get_db)):
    _validate_cron(body.cron_expression)

    try:
        get_docker_client().containers.get(body.container_id)
    except docker.errors.NotFound:
        raise HTTPException(
            status_code=404, detail=f"container '{body.container_id}' not found"
        )

    schedule = Schedule(**body.model_dump())
    db.add(schedule)
    db.commit()
    db.refresh(schedule)

    sync_job(schedule)
    return schedule


def _get_schedule(db: Session, schedule_id: int) -> Schedule:
    schedule = db.get(Schedule, schedule_id)
    if schedule is None:
        raise HTTPException(status_code=404, detail=f"schedule {schedule_id} not found")
    return schedule


@router.patch("/{schedule_id}", response_model=ScheduleOut)
def update_schedule(schedule_id: int, body: ScheduleUpdate, db: Session = Depends(get_db)):
    schedule = _get_schedule(db, schedule_id)
    schedule.enabled = body.enabled
    db.commit()
    db.refresh(schedule)

    sync_job(schedule)
    return schedule


@router.delete("/{schedule_id}", status_code=204)
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = _get_schedule(db, schedule_id)
    remove_job(schedule.id)
    db.delete(schedule)
    db.commit()


@router.get("/{schedule_id}/executions", response_model=list[ExecutionOut])
def list_executions(schedule_id: int, db: Session = Depends(get_db)):
    _get_schedule(db, schedule_id)
    return (
        db.query(ScheduleExecution)
        .filter(ScheduleExecution.schedule_id == schedule_id)
        .order_by(ScheduleExecution.ran_at.desc())
        .limit(50)
        .all()
    )
