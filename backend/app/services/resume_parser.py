import pdfplumber
import docx
import re
import spacy
import numpy as np
from io import BytesIO
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


class CVParser:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")

        self.skills_db = self._load_skills()

    def parse(self, file_bytes, filename):
        text = self.extract_text(file_bytes, filename)
        cleaned_text = self.clean_text(text)

        doc = self.nlp(cleaned_text)

        return {
            "name": self.extract_name(doc, cleaned_text),
            "email": self.extract_email(cleaned_text),
            "phone": self.extract_phone(cleaned_text),
            "skills": self.extract_skills(cleaned_text),
            "experience": self.extract_experience(doc, cleaned_text),
            "education": self.extract_education(doc),
            "projects": self.extract_projects(cleaned_text),
            "seniority_level": self.infer_seniority(cleaned_text),
            "ats_score": self.compute_ats_score(cleaned_text),
            "role_embedding": self.get_embedding(cleaned_text).tolist(),
            "raw_text": cleaned_text[:6000],
        }

    # ---------------- TEXT ----------------
    def extract_text(self, file_bytes, filename):
        text = ""

        if filename.endswith(".pdf"):
            with pdfplumber.open(BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    text += (page.extract_text() or "") + "\n"

        elif filename.endswith(".docx"):
            doc = docx.Document(BytesIO(file_bytes))
            for p in doc.paragraphs:
                text += p.text + "\n"

        return text

    def clean_text(self, text):
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    # ---------------- BASIC INFO ----------------
    def extract_name(self, doc, text):
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                return ent.text
        return text.split("\n")[0]

    def extract_email(self, text):
        emails = re.findall(r'[\w\.-]+@[\w\.-]+', text)
        return emails[0] if emails else ""

    def extract_phone(self, text):
        phones = re.findall(r'(\+?\d[\d\s\-]{8,15}\d)', text)
        return phones[0] if phones else ""

    # ---------------- SKILLS (SMART MATCHING) ----------------
    def _load_skills(self):
        return [
            "python", "java", "c++", "sql", "mysql", "postgresql",
            "mongodb", "fastapi", "django", "flask",
            "react", "node.js", "typescript", "javascript",
            "docker", "kubernetes", "aws", "gcp",
            "machine learning", "deep learning",
            "tensorflow", "pytorch", "nlp",
            "pandas", "numpy", "scikit-learn"
        ]

    def extract_skills(self, text):
        text_lower = text.lower()
        found = []

        for skill in self.skills_db:
            if skill in text_lower:
                found.append(skill)

        return list(set(found))

    # ---------------- EXPERIENCE (STRUCTURED) ----------------
    def extract_experience(self, doc, text):
        experience_blocks = []

        keywords = ["experience", "intern", "engineer", "developer", "worked", "software"]

        for sent in doc.sents:
            if any(k in sent.text.lower() for k in keywords):
                experience_blocks.append(sent.text.strip())

        return experience_blocks[:8]

    # ---------------- EDUCATION ----------------
    def extract_education(self, doc):
        education = []

        for ent in doc.ents:
            if ent.label_ in ["ORG", "GPE"]:
                if any(k in ent.text.lower() for k in ["university", "faculty", "college"]):
                    education.append(ent.text)

        return list(set(education))[:5]

    # ---------------- PROJECTS ----------------
    def extract_projects(self, text):
        keywords = ["project", "built", "developed", "created", "designed"]

        lines = text.split(".")
        return [
            line.strip()
            for line in lines
            if any(k in line.lower() for k in keywords)
        ][:6]

    # ---------------- SENIORITY INFERENCE ----------------
    def infer_seniority(self, text):
        text = text.lower()

        if any(k in text for k in ["intern", "student", "graduate"]):
            return "entry"

        if any(k in text for k in ["2 years", "3 years", "engineer"]):
            return "mid"

        if any(k in text for k in ["senior", "lead", "architect"]):
            return "senior"

        return "entry"

    # ---------------- ATS SCORE ----------------
    def compute_ats_score(self, text):
        score = 0

        factors = {
            "python": 10,
            "project": 10,
            "github": 10,
            "experience": 20,
            "education": 10,
            "docker": 10,
            "sql": 10,
        }

        lower = text.lower()

        for k, v in factors.items():
            if k in lower:
                score += v

        return min(score, 100)

    # ---------------- EMBEDDINGS ----------------
    def get_embedding(self, text):
        return self.embedder.encode(text)