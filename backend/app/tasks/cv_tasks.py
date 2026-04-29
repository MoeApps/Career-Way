# backend/app/tasks/cv_tasks.py
from app.tasks.celery_app import celery_app
from app.services.cv_parser import CVParser
from app.services.score_engine import ScoreEngine
from app.database import SyncSessionLocal
from app.models.cv import CVDocument
from app.models.user import User
from app.utils.s3 import download_from_s3
import logging

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=10)
def parse_cv_task(self, cv_id: str, s3_key: str, user_id: str):
    """
    1. Download CV from S3
    2. Run NLP parsing pipeline
    3. Save structured result to DB
    4. Trigger score recompute
    """
    with SyncSessionLocal() as db:
        cv_doc = db.get(CVDocument, cv_id)
        if not cv_doc:
            logger.error(f"CV {cv_id} not found")
            return

        try:
            cv_doc.parse_status = "processing"
            db.commit()

            # Download from S3
            file_bytes = download_from_s3(s3_key)

            # Parse
            parser = CVParser()
            parsed = parser.parse(file_bytes, cv_doc.filename)

            # Save result
            cv_doc.parsed_data = parsed
            cv_doc.parse_status = "done"
            db.commit()

            # Save extracted skills
            from app.services.skill_service import save_extracted_skills
            save_extracted_skills(db, user_id, parsed["extracted_skills"], source="cv")

            # Trigger score recompute
            compute_score_task.delay(user_id)

        except Exception as exc:
            logger.exception(f"CV parse failed for {cv_id}: {exc}")
            cv_doc.parse_status = "failed"
            cv_doc.parse_error = str(exc)
            db.commit()
            raise self.retry(exc=exc)


# backend/app/tasks/github_tasks.py
@celery_app.task(bind=True, max_retries=3)
def score_github_task(self, user_id: str):
    """Score GitHub profile and save result."""
    from app.services.github_scorer import score_github_profile
    from app.models.github_score import GithubScore

    with SyncSessionLocal() as db:
        user = db.get(User, user_id)
        if not user or not user.github_username:
            return

        try:
            result = score_github_profile(user.github_username, user.github_token)
            score = GithubScore(user_id=user_id, **result)
            db.add(score)
            db.commit()
            compute_score_task.delay(user_id)
        except Exception as exc:
            raise self.retry(exc=exc)


@celery_app.task
def compute_score_task(user_id: str):
    """Recompute full employability score."""
    from app.services.score_engine import compute_employability_score
    from app.models.employability_score import EmployabilityScore

    with SyncSessionLocal() as db:
        user = db.get(User, user_id)
        if not user or not user.target_role:
            return

        result = compute_employability_score(db, user)
        score = EmployabilityScore(user_id=user_id, **result)
        db.add(score)
        db.commit()


@celery_app.task
def fetch_jobs_task():
    """Cron task: fetch new jobs from Adzuna and Arbeitnow, embed them."""
    from app.services.job_fetcher import fetch_adzuna_jobs, fetch_arbeitnow_jobs
    from app.services.embedding_service import EmbeddingService

    with SyncSessionLocal() as db:
        embedder = EmbeddingService()
        jobs = fetch_adzuna_jobs() + fetch_arbeitnow_jobs()
        for job_data in jobs:
            embedding = embedder.embed(f"{job_data['title']} {job_data['description'][:500]}")
            job_data["embedding"] = embedding
            # upsert by external_id
            from app.models.job import Job
            existing = db.query(Job).filter_by(external_id=job_data["external_id"]).first()
            if existing:
                for k, v in job_data.items():
                    setattr(existing, k, v)
            else:
                db.add(Job(**job_data))
        db.commit()
        logger.info(f"Fetched and embedded {len(jobs)} jobs")