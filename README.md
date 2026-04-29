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
