-- ============================================================
-- AI Career Copilot — PostgreSQL Schema
-- Run: psql -d your_db -f schema.sql
-- Requires: pgvector extension
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ──────────────────────────────────────────────────
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               TEXT UNIQUE NOT NULL,
    name                TEXT,
    hashed_password     TEXT,
    github_username     TEXT,
    github_token        TEXT,           -- AES-encrypted at app layer
    target_role         TEXT,
    seniority_level     TEXT DEFAULT 'entry' CHECK (seniority_level IN ('entry','mid','senior')),
    remote_preference   BOOLEAN DEFAULT TRUE,
    declared_interests  TEXT[],         -- e.g. ['NLP','fintech','open-source']
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_github ON users(github_username);

-- ── CV Documents ───────────────────────────────────────────
CREATE TABLE cv_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    s3_key          TEXT NOT NULL,
    filename        TEXT,
    file_size_bytes INT,
    parsed_data     JSONB,              -- full structured parse result
    parse_status    TEXT DEFAULT 'pending'
                    CHECK (parse_status IN ('pending','processing','done','failed')),
    parse_error     TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cv_user ON cv_documents(user_id);

-- ── User Skills (normalised) ───────────────────────────────
CREATE TABLE user_skills (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_name      TEXT NOT NULL,      -- normalised to ESCO taxonomy name
    skill_esco_id   TEXT,               -- ESCO skill URI
    source          TEXT NOT NULL CHECK (source IN ('cv','github','self_declared')),
    confidence      FLOAT DEFAULT 1.0,  -- 0.0–1.0; self_declared gets 0.8
    embedding       vector(384),        -- sentence-transformers all-MiniLM-L6-v2
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, skill_name, source)
);

CREATE INDEX idx_skills_user ON user_skills(user_id);
CREATE INDEX idx_skills_embedding ON user_skills USING ivfflat (embedding vector_cosine_ops);

-- ── Employability Scores (versioned history) ───────────────
CREATE TABLE employability_scores (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    target_role         TEXT,
    overall_score       FLOAT NOT NULL,         -- 0–100
    cv_score            FLOAT,                  -- 0–100
    github_score        FLOAT,                  -- 0–100
    skills_score        FLOAT,                  -- 0–100
    experience_score    FLOAT,                  -- 0–100
    education_score     FLOAT,                  -- 0–100
    percentile          FLOAT,                  -- vs other users for same role
    breakdown           JSONB,                  -- detailed sub-scores
    version             INT DEFAULT 1,
    computed_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_scores_user ON employability_scores(user_id);
CREATE INDEX idx_scores_computed ON employability_scores(user_id, computed_at DESC);

-- ── GitHub Scores ──────────────────────────────────────────
CREATE TABLE github_scores (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    total_score         FLOAT,
    activity_score      FLOAT,          -- commit cadence (25 pts)
    quality_score       FLOAT,          -- stars + forks (25 pts)
    diversity_score     FLOAT,          -- language breadth (20 pts)
    docs_score          FLOAT,          -- README quality (15 pts)
    breadth_score       FLOAT,          -- external contributions (15 pts)
    languages           TEXT[],
    top_repos           JSONB,
    raw_stats           JSONB,
    computed_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_github_user ON github_scores(user_id);

-- ── Jobs ───────────────────────────────────────────────────
CREATE TABLE jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id     TEXT,
    source          TEXT NOT NULL,      -- 'adzuna', 'arbeitnow', 'manual'
    title           TEXT NOT NULL,
    company         TEXT,
    location        TEXT,
    remote          BOOLEAN DEFAULT FALSE,
    description     TEXT,
    required_skills TEXT[],
    nice_to_have    TEXT[],
    min_years_exp   FLOAT DEFAULT 0,
    min_degree      TEXT,               -- 'none','bachelors','masters','phd'
    salary_min      INT,
    salary_max      INT,
    currency        TEXT DEFAULT 'GBP',
    apply_url       TEXT,
    embedding       vector(384),        -- embedded from title + description
    is_active       BOOLEAN DEFAULT TRUE,
    posted_at       TIMESTAMPTZ,
    fetched_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(external_id, source)
);

CREATE INDEX idx_jobs_active ON jobs(is_active, posted_at DESC);
CREATE INDEX idx_jobs_embedding ON jobs USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_jobs_remote ON jobs(remote);

-- ── Job Matches (ranked per user) ─────────────────────────
CREATE TABLE job_matches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id          UUID REFERENCES jobs(id) ON DELETE CASCADE,
    match_score     FLOAT NOT NULL,     -- final XGBoost score (0–1)
    skill_overlap   FLOAT,             -- jaccard coefficient
    semantic_score  FLOAT,             -- cosine similarity
    xgb_score       FLOAT,             -- re-rank score
    missing_skills  TEXT[],
    matched_skills  TEXT[],
    match_reasons   JSONB,             -- human-readable explanation
    user_action     TEXT,              -- NULL / 'clicked' / 'applied' / 'saved'
    matched_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, job_id)
);

CREATE INDEX idx_matches_user ON job_matches(user_id, match_score DESC);

-- ── Skill Gaps ─────────────────────────────────────────────
CREATE TABLE skill_gaps (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    target_role         TEXT NOT NULL,
    missing_skills      TEXT[],
    partial_skills      TEXT[],        -- have basics but not proficient
    recommended_skills  TEXT[],        -- highest ROI to learn next
    gap_score           FLOAT,         -- 0=fully ready, 1=large gap
    llm_explanation     TEXT,          -- LLM-generated human summary
    analysed_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gaps_user ON skill_gaps(user_id, analysed_at DESC);

-- ── Project Recommendations ────────────────────────────────
CREATE TABLE project_recommendations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    skills_covered  TEXT[],
    skills_required TEXT[],
    difficulty      TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')),
    estimated_hours INT,
    github_template TEXT,              -- URL to starter template
    resource_links  JSONB,
    rank            INT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_projects_user ON project_recommendations(user_id, rank);

-- ── Learning Roadmap Steps ─────────────────────────────────
CREATE TABLE roadmap_steps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    step_order      INT NOT NULL,
    week_number     INT,
    title           TEXT NOT NULL,
    description     TEXT,
    resource_url    TEXT,
    resource_type   TEXT CHECK (resource_type IN ('course','doc','video','project','book','practice')),
    resource_name   TEXT,              -- e.g. "fast.ai Practical Deep Learning"
    skill_target    TEXT,              -- which skill this step addresses
    estimated_hours INT,
    completed       BOOLEAN DEFAULT FALSE,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_roadmap_user ON roadmap_steps(user_id, step_order);

-- ── Role Templates (seeded from O*NET / ESCO) ──────────────
CREATE TABLE role_templates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name           TEXT UNIQUE NOT NULL,
    category            TEXT,          -- 'engineering','data','design','devops'
    required_skills     TEXT[],
    nice_to_have        TEXT[],
    avg_years_exp       FLOAT,
    typical_salary_gbp  INT,
    score_weights       JSONB,         -- override default weights for this role
    created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── Async Task Log ─────────────────────────────────────────
CREATE TABLE task_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id     TEXT,                  -- Celery task ID
    task_type   TEXT,                  -- 'cv_parse','github_score','job_match'
    status      TEXT DEFAULT 'queued' CHECK (status IN ('queued','running','done','failed')),
    error       TEXT,
    started_at  TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tasks_user ON task_log(user_id, created_at DESC);

-- ── Updated-at trigger ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();