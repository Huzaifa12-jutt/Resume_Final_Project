"""In-memory demo database used for local preview mode when no real Supabase credentials exist."""

import uuid
from copy import deepcopy

from app.core.security import hash_password


class _Result:
    def __init__(self, data):
        self.data = data


class _StorageBucket:
    def __init__(self):
        self.files = {}

    def upload(self, path, file_bytes, file_options=None):
        self.files[path] = file_bytes
        return {"path": path}

    def create_signed_url(self, path, expires_in=3600):
        return {"signedURL": f"https://demo.supabase.local/storage/{path}?token=demo"}


class _Storage:
    def __init__(self):
        self._buckets = {}

    def from_(self, bucket_name):
        self._buckets.setdefault(bucket_name, _StorageBucket())
        return self._buckets[bucket_name]


class _Query:
    def __init__(self, table):
        self.table = table
        self.filters = []
        self.select_cols = "*"
        self.order_col = None
        self.order_desc = False
        self._op = None
        self._payload = None
        self._in_col = None
        self._in_values = None

    def select(self, cols):
        self.select_cols = cols
        self._op = "select"
        return self

    def insert(self, payload):
        self._op = "insert"
        self._payload = payload
        return self

    def update(self, payload):
        self._op = "update"
        self._payload = payload
        return self

    def delete(self):
        self._op = "delete"
        return self

    def eq(self, col, val):
        self.filters.append((col, val))
        return self

    def in_(self, col, values):
        self._in_col = col
        self._in_values = values
        return self

    def order(self, col, desc=False):
        self.order_col = col
        self.order_desc = desc
        return self

    def _matches_filters(self, row):
        return all(row.get(col) == val for col, val in self.filters)

    def execute(self):
        rows = self.table.rows

        if self._op == "insert":
            payload = self._payload if isinstance(self._payload, list) else [self._payload]
            created = []
            for p in payload:
                row = deepcopy(p)
                row.setdefault("id", str(uuid.uuid4()))
                row.setdefault("created_at", "2026-01-01T00:00:00Z")
                rows.append(row)
                created.append(deepcopy(row))
            return _Result(created)

        if self._op == "update":
            updated = []
            for r in rows:
                if self._matches_filters(r):
                    r.update(deepcopy(self._payload) if isinstance(self._payload, dict) else self._payload)
                    updated.append(deepcopy(r))
            return _Result(updated)

        if self._op == "delete":
            to_delete = [r for r in rows if all(r.get(col) == val for col, val in self.filters)]
            for r in to_delete:
                rows.remove(r)
            return _Result([r["id"] for r in to_delete])

        matched = [deepcopy(r) for r in rows if all(r.get(col) == val for col, val in self.filters)]

        if self._in_col and self._in_values is not None:
            matched = [deepcopy(r) for r in matched if r.get(self._in_col) in self._in_values]

        if "scores(*)" in self.select_cols:
            for r in matched:
                r["scores"] = [
                    deepcopy(s) for s in self.table.db.tables["scores"].rows if s.get("candidate_id") == r["id"]
                ]

        if self.order_col:
            matched.sort(key=lambda r: r.get(self.order_col) or "", reverse=self.order_desc)

        return _Result(matched)


class _Table:
    def __init__(self, db, name):
        self.db = db
        self.name = name
        self.rows = []


class DemoSupabase:
    def __init__(self):
        self.tables = {name: _Table(self, name) for name in [
            "users", "companies", "jobs", "candidates", "scores",
            "chat_messages", "system_notifications", "candidate_profiles",
            "applications", "saved_jobs", "recruiter_profiles",
            "interviews", "interview_questions", "interview_answers"
        ]}
        self.storage = _Storage()
        self._seed_demo_data()

    def _seed_demo_data(self):
        demo_user = {
            "id": "demo-user-1",
            "full_name": "Ayesha Siddiqui",
            "email": "candidate@talentlense.demo",
            "password_hash": hash_password("DemoPass123!"),
            "role": "candidate",
            "email_verified": True,
            "is_active": True,
            "phone": "+92 300 555 0123",
        }
        self.tables["users"].rows.append(demo_user)

        recruiter = {
            "id": "demo-user-2",
            "full_name": "Ali Hassan",
            "email": "recruiter@talentlense.demo",
            "password_hash": hash_password("RecruitPass123!"),
            "role": "recruiter",
            "email_verified": True,
            "is_active": True,
        }
        self.tables["users"].rows.append(recruiter)

        self.tables["companies"].rows.append({
            "id": "demo-company-1",
            "owner_id": "demo-user-2",
            "company_name": "TEEROP",
            "website": "https://teerop.com",
            "description": "Technology and hiring platform transforming how talent is discovered and evaluated.",
        })

        self.tables["jobs"].rows.append({
            "id": "demo-job-1",
            "title": "Senior Product Designer",
            "description": "Design polished end-to-end hiring and candidate experiences for a modern digital platform.",
            "company_name": "TEEROP",
            "company_id": "demo-company-1",
            "recruiter_id": "demo-user-2",
            "location": "Islamabad, Pakistan",
            "employment_type": "Full-time",
            "status": "active",
            "salary_min": 120000,
            "salary_max": 170000,
            "required_skills": ["Figma", "Design systems", "UX Research", "Product thinking"],
            "openings": 2,
        })

        self.tables["jobs"].rows.append({
            "id": "demo-job-2",
            "title": "Frontend Engineer",
            "description": "Build a clean, responsive interface with React and strong product intuition for a modern hiring platform.",
            "company_name": "TEEROP",
            "company_id": "demo-company-1",
            "recruiter_id": "demo-user-2",
            "location": "Islamabad, Pakistan",
            "employment_type": "Hybrid",
            "status": "active",
            "salary_min": 140000,
            "salary_max": 200000,
            "required_skills": ["React", "TypeScript", "UI Systems", "Accessibility"],
            "openings": 1,
        })

        self.tables["candidate_profiles"].rows.append({
            "id": "demo-profile-1",
            "user_id": "demo-user-1",
            "full_name": "Ayesha Siddiqui",
            "resume_path": "demo/demo-candidate.pdf",
            "skills": ["React", "TypeScript", "UX", "Product strategy"],
            "summary": "Product-minded frontend engineer with experience designing and shipping polished customer experiences.",
            "raw_text": "Product-minded frontend engineer with React, TypeScript, UX, and product strategy experience building polished SaaS workflows.",
        })

    def table(self, name):
        return _Query(self.tables[name])


def get_demo_supabase():
    return DemoSupabase()
