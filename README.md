# Career-Copilot
Your personal AI career strategist that turns student profiles into job-ready roadmaps.


## Overview

AI Career Copilot is a full-stack ML platform that ingests a student's CV, GitHub
profile, and declared skills/interests, then returns:

1. Employability score (0–100) with breakdown
2. Missing skills for their target role
3. Best projects to build next
4. Personalised learning roadmap
5. Ranked job matches by fit

---

## System Layers

```
User Inputs: CV PDF · GitHub OAuth · Skills/Interests · Target Role
                              |
                     Frontend (Next.js 14)
             Dashboard · Profile Wizard · Job Board · Roadmap
                              |  HTTPS / WebSocket
                     API Gateway (FastAPI)
              JWT Auth · Rate limiting · OpenAPI docs
          |            |             |            |
     CV Parser    GitHub Scorer  Score Engine  Job Matcher
     spaCy/PDF    PyGitHub       Weighted      XGBoost
          |            |             |            |
                 Celery Worker Pool + Redis
         (async: parse CV · score GitHub · generate roadmap)
                              |
                       ML Pipeline
           sentence-transformers · LLM · XGBoost ranker
                              |
         PostgreSQL  |  Redis  |  pgvector  |  S3/MinIO
         (users,jobs)  (cache)  (embeddings)  (CV files)
```

---

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- Zustand (global state) + React Query (server state)
- shadcn/ui + Tailwind CSS
- Recharts (radar charts, gauges, timelines)
- NextAuth.js (GitHub OAuth)
- react-dropzone (CV upload)

### Backend
- FastAPI (Python 3.11)
- Celery 5 + Redis (async task queue)
- SQLAlchemy 2 + Alembic (ORM + migrations)
- python-jose (JWT) + passlib/bcrypt (auth)
- PyMuPDF + pdfplumber (CV text extraction)
- spaCy (NLP pipeline)
- PyGitHub (GitHub API)
- sentence-transformers (embeddings)
- XGBoost (job ranking model)
- LangChain + OpenAI/Claude API (roadmap generation)

### Infrastructure
- PostgreSQL 15 + pgvector extension
- Redis 7
- S3 / MinIO (object storage)
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Railway or Render (hosting)
- Sentry + Prometheus + Grafana (monitoring)

---

## Data Flow (Happy Path)

1. User uploads CV → stored in S3, Celery task queued
2. CV parse task runs: extract text → spaCy NLP → skill taxonomy match → JSON stored in DB
3. User connects GitHub → OAuth token stored → GitHub score task queued
4. GitHub score task: fetch repos, PRs, commits → compute 5-axis score → stored in DB
5. User selects target role → skill gap computed → score engine runs → employability score stored
6. Job fetch cron (every 6h): Adzuna API → embed job descriptions → stored in DB with pgvector
7. Job matcher: embed user profile → cosine search (top 50) → XGBoost re-rank → ranked list returned
8. Roadmap generator: LLM call with skill gaps + target role → structured steps stored in DB
9. Dashboard renders: all results served from DB, no blocking ML calls in request path
