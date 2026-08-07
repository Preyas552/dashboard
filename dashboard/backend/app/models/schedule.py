from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Schedule(Base):
    __tablename__ = "schedules"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    cron_expression: Mapped[str] = mapped_column(String, nullable=False)
    container_id: Mapped[str] = mapped_column(String, nullable=False)
    container_name: Mapped[str] = mapped_column(String, nullable=False)
    action: Mapped[str] = mapped_column(String, nullable=False)  # start | stop | restart
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    executions: Mapped[list["ScheduleExecution"]] = relationship(
        back_populates="schedule", cascade="all, delete-orphan", order_by="desc(ScheduleExecution.ran_at)"
    )


class ScheduleExecution(Base):
    __tablename__ = "schedule_executions"

    id: Mapped[int] = mapped_column(primary_key=True)
    schedule_id: Mapped[int] = mapped_column(ForeignKey("schedules.id"), nullable=False)
    ran_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    success: Mapped[bool] = mapped_column(Boolean, nullable=False)
    message: Mapped[str] = mapped_column(String, nullable=False)

    schedule: Mapped["Schedule"] = relationship(back_populates="executions")
