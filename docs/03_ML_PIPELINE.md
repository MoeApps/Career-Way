# ML Pipeline Design

## 1. CV Parsing NLP Pipeline

### Stage 1 — Text Extraction
```python
# backend/app/services/cv_parser.py
import pdfplumber
import fitz  # PyMuPDF

def extract_text(file_bytes: bytes, filename: str) -> str:
    if filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    # fallback for scanned PDFs
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    return "\n".join(page.get_text() for page in doc)
```

### Stage 2 — Section Segmentation
```python
import re

SECTION_HEADERS = {
    "experience": r"(work\s+experience|employment|professional\s+experience)",
    "education":  r"(education|academic|qualifications)",
    "skills":     r"(skills|technical\s+skills|competencies|technologies)",
    "projects":   r"(projects|portfolio|personal\s+projects)",
    "summary":    r"(summary|profile|objective|about\s+me)",
}

def segment_sections(text: str) -> dict[str, str]:
    sections = {}
    lines = text.split("\n")
    current_section = "other"
    for line in lines:
        for section, pattern in SECTION_HEADERS.items():
            if re.search(pattern, line.lower()):
                current_section = section
                break
        sections.setdefault(current_section, []).append(line)
    return {k: "\n".join(v) for k, v in sections.items()}
```

### Stage 3 — Skill Extraction (3-tier)
```python
from rapidfuzz import process, fuzz
from sentence_transformers import SentenceTransformer, util

# Tier 1: Exact match against ESCO taxonomy (loaded at startup)
def exact_match(token: str, taxonomy: set[str]) -> str | None:
    return token if token.lower() in taxonomy else None

# Tier 2: Fuzzy match (catches 'PyTorch' vs 'pytorch', 'React.js' vs 'ReactJS')
def fuzzy_match(token: str, taxonomy: list[str], threshold=85) -> str | None:
    result = process.extractOne(token, taxonomy, scorer=fuzz.token_sort_ratio)
    return result[0] if result and result[1] >= threshold else None

# Tier 3: Semantic match (catches 'neural networks' → 'deep learning')
model = SentenceTransformer("all-MiniLM-L6-v2")

def semantic_match(token: str, taxonomy_embeddings, taxonomy: list[str],
                   threshold=0.80) -> str | None:
    token_emb = model.encode(token, convert_to_tensor=True)
    scores = util.cos_sim(token_emb, taxonomy_embeddings)[0]
    best_idx = scores.argmax().item()
    if scores[best_idx] >= threshold:
        return taxonomy[best_idx]
    return None
```

### Stage 4 — Experience Quantification
```python
import dateparser
from datetime import datetime

def extract_years_experience(text: str) -> float:
    total_months = 0
    # Pattern: "Jan 2021 – Mar 2023" or "2020 - Present"
    date_ranges = re.findall(
        r"(\w+\s+\d{4}|\d{4})\s*[–\-—to]+\s*(\w+\s+\d{4}|present|current)",
        text, re.IGNORECASE
    )
    for start_str, end_str in date_ranges:
        start = dateparser.parse(start_str)
        end = datetime.now() if end_str.lower() in ("present","current") \
              else dateparser.parse(end_str)
        if start and end:
            total_months += (end.year - start.year) * 12 + (end.month - start.month)
    return round(total_months / 12, 1)
```

---

## 2. GitHub Scoring Logic

```python
# backend/app/services/github_scorer.py
from github import Github
from datetime import datetime, timedelta

def score_github_profile(username: str, token: str) -> dict:
    g = Github(token)
    user = g.get_user(username)
    repos = [r for r in user.get_repos() if not r.fork]  # exclude forks

    # ── Activity score (25 pts) ────────────────────────────
    since = datetime.now() - timedelta(days=90)
    commits_90d = sum(
        repo.get_commits(author=username, since=since).totalCount
        for repo in repos[:20]  # cap API calls
    )
    activity = min(commits_90d / 200 * 25, 25)

    # ── Project quality (25 pts) ───────────────────────────
    stars = sum(r.stargazers_count for r in repos)
    forks = sum(r.forks_count for r in repos)
    quality = min((stars * 2 + forks) / 500 * 25, 25)

    # ── Language diversity (20 pts) ────────────────────────
    langs = {r.language for r in repos if r.language}
    diversity = min(len(langs) / 8 * 20, 20)

    # ── Documentation quality (15 pts) ────────────────────
    def has_good_readme(repo) -> bool:
        try:
            readme = repo.get_readme()
            return len(readme.decoded_content) > 500  # >500 chars = meaningful
        except Exception:
            return False
    documented = sum(1 for r in repos if has_good_readme(r))
    docs = min(documented / max(len(repos), 1) * 15, 15)

    # ── Contribution breadth (15 pts) ─────────────────────
    # Count PRs to repos the user doesn't own
    query = f"is:pr author:{username} -user:{username}"
    external_prs = g.search_issues(query).totalCount
    breadth = min(external_prs / 20 * 15, 15)

    total = activity + quality + diversity + docs + breadth

    # ── Bonus signals (informational, not scored) ─────────
    has_cicd = any(
        repo.get_contents(".github/workflows")
        for repo in repos[:10]
        if True  # catch exceptions per-repo
    )

    return {
        "total_score": round(total, 1),
        "activity_score": round(activity, 1),
        "quality_score": round(quality, 1),
        "diversity_score": round(diversity, 1),
        "docs_score": round(docs, 1),
        "breadth_score": round(breadth, 1),
        "languages": sorted(langs),
        "commits_last_90d": commits_90d,
        "total_stars": stars,
        "has_cicd": has_cicd,
    }
```

---

## 3. Employability Score Formula

```python
# backend/app/services/score_engine.py

DEFAULT_WEIGHTS = {
    "skills":     0.30,
    "cv":         0.25,
    "github":     0.20,
    "experience": 0.15,
    "education":  0.10,
}

ROLE_WEIGHT_OVERRIDES = {
    "Research Scientist":    {"education": 0.25, "skills": 0.30, "github": 0.15, "cv": 0.20, "experience": 0.10},
    "DevOps Engineer":       {"github": 0.30, "skills": 0.30, "cv": 0.20, "experience": 0.15, "education": 0.05},
    "Frontend Developer":    {"github": 0.25, "skills": 0.35, "cv": 0.20, "experience": 0.15, "education": 0.05},
}

def compute_employability_score(
    user_skills: list[str],
    cv_data: dict,
    github_score: float,
    target_role: str,
    role_required_skills: list[str],
) -> dict:

    weights = ROLE_WEIGHT_OVERRIDES.get(target_role, DEFAULT_WEIGHTS)

    # Skills score — Jaccard similarity
    user_set = set(s.lower() for s in user_skills)
    role_set = set(s.lower() for s in role_required_skills)
    skills_score = len(user_set & role_set) / len(role_set) * 100 if role_set else 0

    # CV score — completeness heuristic
    cv_score = compute_cv_score(cv_data, target_role)

    # Experience score — years vs role benchmark
    benchmark_years = {"entry": 0, "mid": 3, "senior": 6}.get(cv_data.get("seniority","entry"), 0)
    exp_years = cv_data.get("years_experience", 0)
    exp_score = min(exp_years / max(benchmark_years, 1), 1.0) * 100 if benchmark_years > 0 else 70

    # Education score
    edu_score = compute_education_score(cv_data)

    overall = (
        weights["skills"]     * skills_score +
        weights["cv"]         * cv_score +
        weights["github"]     * github_score +
        weights["experience"] * exp_score +
        weights["education"]  * edu_score
    )

    return {
        "overall_score":   round(overall, 1),
        "skills_score":    round(skills_score, 1),
        "cv_score":        round(cv_score, 1),
        "github_score":    round(github_score, 1),
        "experience_score":round(exp_score, 1),
        "education_score": round(edu_score, 1),
        "weights_used":    weights,
        "missing_skills":  sorted(role_set - user_set),
        "matched_skills":  sorted(user_set & role_set),
    }

def compute_cv_score(cv_data: dict, target_role: str) -> float:
    score = 0
    if cv_data.get("email"):          score += 10
    if cv_data.get("name"):           score += 5
    if cv_data.get("experience"):     score += 25
    if cv_data.get("education"):      score += 20
    if cv_data.get("projects_count", 0) >= 2: score += 20
    if cv_data.get("certifications"): score += 10
    if len(cv_data.get("extracted_skills", [])) >= 8: score += 10
    return min(score, 100)

def compute_education_score(cv_data: dict) -> float:
    degree_scores = {"phd": 100, "masters": 85, "bachelors": 70, "associate": 50, "none": 30}
    degree = cv_data.get("highest_degree", "none").lower()
    return degree_scores.get(degree, 50)
```

---

## 4. Job Matching — Two-Stage Ranking

### Stage 1: Semantic Retrieval (pgvector)
```python
# backend/app/services/job_matcher.py
from sqlalchemy import text

async def retrieve_candidate_jobs(user_embedding: list[float], limit=50) -> list:
    query = text("""
        SELECT id, title, company, required_skills, embedding,
               1 - (embedding <=> :user_emb::vector) AS cosine_score
        FROM jobs
        WHERE is_active = true
          AND (1 - (embedding <=> :user_emb::vector)) > 0.4
        ORDER BY embedding <=> :user_emb::vector
        LIMIT :limit
    """)
    return await db.execute(query, {"user_emb": user_embedding, "limit": limit})
```

### Stage 2: XGBoost Re-ranking
```python
import xgboost as xgb
import numpy as np
from sklearn.metrics import jaccard_score

def build_feature_vector(user_profile: dict, job: dict, semantic_score: float) -> np.ndarray:
    user_skills = set(s.lower() for s in user_profile["skills"])
    job_skills  = set(s.lower() for s in job["required_skills"])

    skill_overlap = len(user_skills & job_skills) / len(job_skills) if job_skills else 0
    exp_gap = abs(user_profile["years_exp"] - job.get("min_years_exp", 0))
    salary_score = 1.0  # TODO: compute from user expectations

    return np.array([
        semantic_score,                                          # cosine sim
        skill_overlap,                                           # jaccard
        min(exp_gap / 5, 1.0),                                  # normalised gap
        1.0 if user_profile.get("remote_pref") == job.get("remote") else 0.5,
        len(user_skills & set(job.get("tech_stack", []))) / max(len(job.get("tech_stack",[])),1),
        salary_score,
    ])

def rank_jobs(user_profile: dict, candidate_jobs: list, model: xgb.XGBRanker) -> list:
    if not candidate_jobs:
        return []
    features = np.array([
        build_feature_vector(user_profile, job, job["cosine_score"])
        for job in candidate_jobs
    ])
    scores = model.predict(features)
    ranked = sorted(zip(candidate_jobs, scores), key=lambda x: x[1], reverse=True)
    return [{"job": job, "match_score": float(score)} for job, score in ranked]
```

### Training the Ranker (run offline)
```python
# scripts/train_ranker.py
import xgboost as xgb
import pandas as pd

# Labels: 2=applied+positive, 1=clicked, 0=ignored
df = pd.read_csv("data/interaction_log.csv")
X = df[["semantic_score","skill_overlap","exp_gap","remote_match","tech_overlap","salary_score"]]
y = df["label"]
groups = df.groupby("user_id").size().values  # for LTR

model = xgb.XGBRanker(
    objective="rank:pairwise",
    n_estimators=300,
    max_depth=5,
    learning_rate=0.05,
    subsample=0.8,
)
model.fit(X, y, group=groups, eval_set=[(X_val, y_val)], verbose=10)
model.save_model("app/ml/models/job_ranker.json")
```

---

## 5. Recommendation Engine

### Project Recommendations
```python
# backend/app/services/recommender.py

PROJECT_TEMPLATES = [
    {
        "title": "Real-time Stock Dashboard",
        "skills_covered": ["FastAPI","WebSocket","React","PostgreSQL","Redis"],
        "difficulty": "intermediate",
        "estimated_hours": 40,
        "github_template": "https://github.com/...",
    },
    {
        "title": "NLP Sentiment Classifier API",
        "skills_covered": ["Python","spaCy","FastAPI","Docker","Hugging Face"],
        "difficulty": "intermediate",
        "estimated_hours": 30,
    },
    # ... 200+ templates seeded from datasets/project_templates.json
]

def recommend_projects(missing_skills: list[str], user_skills: list[str], n=5) -> list:
    scored = []
    for project in PROJECT_TEMPLATES:
        covered = set(project["skills_covered"]) & set(missing_skills)
        already_known = set(project["skills_covered"]) & set(user_skills)
        # Score = skills learned / total project skills, weighted by demand
        score = len(covered) / len(project["skills_covered"])
        feasibility = len(already_known) / len(project["skills_covered"])
        final = score * 0.6 + feasibility * 0.4  # learnable AND achievable
        scored.append((final, project))
    return [p for _, p in sorted(scored, reverse=True)[:n]]
```

### Learning Roadmap (LLM-generated)
```python
# backend/app/services/roadmap_generator.py
from langchain.chat_models import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser

ROADMAP_PROMPT = """
You are a senior career coach. Generate a personalised learning roadmap.

Target role: {target_role}
Current skills: {current_skills}
Missing skills (priority order): {missing_skills}
Available hours per week: {hours_per_week}

Return a JSON array of roadmap steps, each with:
- step_order (int)
- week_number (int)
- title (str, max 60 chars)
- description (str, max 200 chars)
- skill_target (str — which missing skill this addresses)
- resource_name (str — specific course, doc, or project name)
- resource_url (str)
- resource_type (one of: course, doc, video, project, book, practice)
- estimated_hours (int)

Prioritise free resources. Be specific — name the exact course, not just the platform.
"""

async def generate_roadmap(user: User, gap: SkillGap) -> list[RoadmapStep]:
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)
    prompt = ROADMAP_PROMPT.format(
        target_role=user.target_role,
        current_skills=", ".join(user.skills[:20]),
        missing_skills=", ".join(gap.missing_skills[:10]),
        hours_per_week=10,
    )
    response = await llm.apredict(prompt)
    steps_data = json.loads(response)
    return [RoadmapStep(**step, user_id=user.id) for step in steps_data]
```

---

## 6. Datasets & Resources

| Dataset | Purpose | URL |
|---------|---------|-----|
| ESCO Skills Taxonomy v1.1 | Canonical skill list (13,890 skills) | ec.europa.eu/esco/portal |
| O*NET Occupation Data | Role → required skills mapping | onetcenter.org/database |
| LinkedIn Job Postings (Kaggle) | Training data for ranker | kaggle.com/datasets/arshkon/linkedin-job-postings |
| jjzha/skillspan (HuggingFace) | NER training for skill extraction | huggingface.co/datasets/jjzha/skillspan |
| Coursera Course Dataset | Resource URLs for roadmap | kaggle.com/datasets/siddharthm1106/coursera-course-dataset |
| Stack Overflow Survey 2024 | Salary benchmarks, tech popularity | survey.stackoverflow.co |
| Adzuna Jobs API | Live job listings (free: 250/day) | developer.adzuna.com |
| Arbeitnow API | Free jobs, no auth required | arbeitnow.com/api/job-board-api |