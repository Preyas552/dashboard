from apscheduler.jobstores.base import JobLookupError
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.core.docker_client import get_docker_client
from app.db import SessionLocal
from app.models.schedule import Schedule, ScheduleExecution

scheduler = BackgroundScheduler()


def run_schedule(schedule_id: int):
    db = SessionLocal()
    try:
        schedule = db.get(Schedule, schedule_id)
        if schedule is None or not schedule.enabled:
            return
        try:
            client = get_docker_client()
            container = client.containers.get(schedule.container_id)
            getattr(container, schedule.action)()
            message = f"{schedule.action} succeeded on {schedule.container_name}"
            success = True
        except Exception as exc:
            message = str(exc)
            success = False
        db.add(ScheduleExecution(schedule_id=schedule.id, success=success, message=message))
        db.commit()
    finally:
        db.close()


def sync_job(schedule: Schedule):
    if not schedule.enabled:
        remove_job(schedule.id)
        return
    scheduler.add_job(
        run_schedule,
        trigger=CronTrigger.from_crontab(schedule.cron_expression),
        args=[schedule.id],
        id=str(schedule.id),
        replace_existing=True,
    )


def remove_job(schedule_id: int):
    try:
        scheduler.remove_job(str(schedule_id))
    except JobLookupError:
        pass


def load_all_jobs():
    db = SessionLocal()
    try:
        for schedule in db.query(Schedule).filter(Schedule.enabled.is_(True)).all():
            sync_job(schedule)
    finally:
        db.close()
