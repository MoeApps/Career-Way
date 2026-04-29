# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.v1 import auth, users, cv, github, scores, jobs, roadmap, recommendations
from app.database import engine, Base
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load ML models into memory once
    from app.ml.skill_extractor import SkillExtractor
    from app.ml.ranking_model import JobRanker
    app.state.skill_extractor = SkillExtractor()
    app.state.job_ranker = JobRanker.load("app/ml/models/job_ranker.json")
    yield
    # Shutdown cleanup (if needed)


app = FastAPI(
    title="AI Career Copilot API",
    description="Full-stack ML platform for student career intelligence",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router,            prefix="/api/v1/auth",            tags=["Auth"])
app.include_router(users.router,           prefix="/api/v1/users",           tags=["Users"])
app.include_router(cv.router,              prefix="/api/v1/cv",              tags=["CV"])
app.include_router(github.router,          prefix="/api/v1/github",          tags=["GitHub"])
app.include_router(scores.router,          prefix="/api/v1/scores",          tags=["Scores"])
app.include_router(jobs.router,            prefix="/api/v1/jobs",            tags=["Jobs"])
app.include_router(roadmap.router,         prefix="/api/v1/roadmap",         tags=["Roadmap"])
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["Recommendations"])


@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}