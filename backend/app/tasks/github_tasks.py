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