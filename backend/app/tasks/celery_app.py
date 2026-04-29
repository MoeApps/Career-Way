# backend/app/tasks/celery_app.py
from celery import Celery
from celery.schedules import crontab
from app.config import settings

celery_app = Celery(
    "career_copilot",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.cv_tasks",
        "app.tasks.github_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,  # fair dispatch for long ML tasks

    # Periodic tasks (Celery Beat)
    beat_schedule={
        "fetch-jobs-every-6h": {
            "task": "app.tasks.cv_tasks.fetch_jobs_task",
            "schedule": crontab(minute=0, hour="*/6"),
        },
    },
)