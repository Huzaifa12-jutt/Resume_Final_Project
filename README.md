# TalentLens API — Backend

FastAPI backend for the AI-powered resume screening & candidate ranking system.
This replaces the original Streamlit prototype — same parsing/scoring/chatbot
logic, now exposed as a proper REST API so a separate frontend (React, or
anything else) can be built against it.

---

## 1. Architecture

```
Frontend (built separately)
   |
   |  HTTPS / REST
   v
FastAPI Backend  (this repo)
   |-- routers/       jobs, candidates, rankings, chat  — HTTP layer only
   |-- services/       resume_parser, vector_store, ranking_engine,
   |                    chatbot, cv_generator  — unchanged core logic
   |-- db/              supabase_client, models (Pydantic schemas)
   |-- core/            config (env-based settings)
   |
   |-- Supabase Postgres   (jobs, candidates, scores, chat_messages)
   |-- Supabase Storage    (resume PDFs, private bucket)
   |
   v
Groq API (llama-3.1-8b-instant) — chatbot only, key stays server-side
```

The frontend never talks to Supabase or Groq directly — it only calls this
API. All secrets live in this backend's environment variables.

---

## 2. Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app entrypoint, CORS, health check
│   ├── routers/
│   │   ├── jobs.py             # POST/GET/DELETE /jobs
│   │   ├── candidates.py       # resume upload, sample generation, profile fetch
│   │   ├── rankings.py         # POST /rank, GET /export (CSV)
│   │   └── chat.py             # POST /chat, GET /chat/history
│   ├── services/                # unchanged core logic (no FastAPI/DB imports)
│   │   ├── resume_parser.py
│   │   ├── vector_store.py
│   │   ├── ranking_engine.py
│   │   ├── chatbot.py
│   │   └── cv_generator.py
│   ├── db/
│   │   ├── supabase_client.py  # the only module that imports `supabase`
│   │   └── models.py           # Pydantic request/response schemas
│   └── core/
│       └── config.py           # env var settings
├── tests/
│   ├── fake_supabase.py        # in-memory Supabase fake, for testing
│   └── test_pipeline.py        # end-to-end smoke test (no real DB needed)
├── schema.sql                   # run this in Supabase's SQL Editor
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

---

## 3. Setup

### 3.1 Create the Supabase project
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run everything in `schema.sql` — this creates
   the `jobs`, `candidates`, `scores`, `chat_messages` tables and the private
   `resumes` storage bucket.
3. From **Project Settings → API**, copy the **Project URL** and the
   **service_role key** (not the anon key — the backend needs the service
   role key to bypass RLS for server-side writes).

### 3.2 Configure environment variables
```bash
cd backend
cp .env.example .env
# then edit .env and fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, GROQ_API_KEY
```

If you are using Gmail for SMTP, use an app password and not your normal Google password.
Add these values to `.env`:
```text
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com
```

### 3.3 Install & run locally
```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Visit **http://localhost:8000/docs** — FastAPI auto-generates full interactive
API docs (Swagger UI) where every endpoint can be tested directly in the
browser, no frontend required.

### 3.4 Verify everything works
```bash
python -m tests.test_pipeline
```
This runs a full create-job → upload-sample-resumes → rank → chat → export →
delete cycle against an in-memory fake Supabase (no real credentials needed)
and prints PASS/FAIL for every step — useful to confirm the code itself is
correct before wiring up real Supabase/Groq credentials.

---

## 4. API Reference

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Health check — reports missing config instead of failing silently |
| `/jobs` | POST | Create a job (`title`, `description`) |
| `/jobs` | GET | List all jobs |
| `/jobs/{job_id}` | GET | Fetch a job with its ranked candidates |
| `/jobs/{job_id}` | DELETE | Delete a job (cascades to candidates/scores/chat) |
| `/jobs/{job_id}/candidates` | POST | Upload one or more PDF resumes (`multipart/form-data`, field name `files`) |
| `/jobs/{job_id}/candidates/sample` | POST | Generate & store the 2 built-in sample resumes |
| `/jobs/{job_id}/candidates/{candidate_id}` | GET | Full parsed profile of one candidate |
| `/jobs/{job_id}/candidates/{candidate_id}` | DELETE | Remove a candidate |
| `/jobs/{job_id}/rank` | POST | Run scoring for every candidate on this job, persist results |
| `/jobs/{job_id}/export` | GET | Download rankings as CSV |
| `/jobs/{job_id}/chat` | POST | Ask the AI HR chatbot a question (`message`) |
| `/jobs/{job_id}/chat/history` | GET | Fetch chat history for a job |

Full request/response schemas are visible at `/docs`.

### Quick manual test with curl
```bash
# 1. create a job
JOB_ID=$(curl -s -X POST localhost:8000/jobs \
  -H "Content-Type: application/json" \
  -d '{"title":"Senior AI/ML Engineer","description":"5+ years Python, TensorFlow, AWS, Docker"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")

# 2. generate sample resumes for it
curl -s -X POST localhost:8000/jobs/$JOB_ID/candidates/sample

# 3. rank them
curl -s -X POST localhost:8000/jobs/$JOB_ID/rank

# 4. see the results
curl -s localhost:8000/jobs/$JOB_ID
```

---

## 5. Deployment

### Backend (Render / Railway / Fly.io — any Docker host)
1. Push this repo to GitHub.
2. Create a new **Web Service** from the repo, pick **Docker** as the
   environment (the included `Dockerfile` handles the rest).
3. Set environment variables in the platform's dashboard: `SUPABASE_URL`,
   `SUPABASE_SERVICE_KEY`, `GROQ_API_KEY`, `ALLOWED_ORIGINS` (set this to your
   deployed frontend's URL once it exists).
4. Deploy. The platform will build the Docker image and run it — `/health`
   is a good URL to point the platform's health check at.

### Frontend
Not part of this repo — point whatever frontend gets built at this backend's
deployed URL, and add that URL to `ALLOWED_ORIGINS` here so CORS allows it.

---

## 6. Notes on Design Decisions

- **Why the service role key, not the anon key?** The backend does all
  writes on behalf of users (no per-request user JWT yet), so it needs to
  bypass Row Level Security. RLS is already enabled on every table in
  `schema.sql` so that adding Supabase Auth later is a policy change, not a
  schema change.
- **Why does `/rank` delete + re-insert scores instead of updating?** Keeps
  the logic simple and avoids partial-update bugs — a job's candidate list
  rarely changes between ranking runs, so this is cheap.
- **Why is the Groq key never accepted from the frontend?** Unlike the
  original Streamlit prototype (which had a "paste your key" sidebar field
  for quick demos), a real deployed product should never ask end users for
  API keys — it's a server-side secret now, full stop.
