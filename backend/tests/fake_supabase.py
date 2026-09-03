"""
Lightweight in-memory fake of the pieces of the Supabase client this
project actually uses, so the full API pipeline can be exercised in tests
without a real Supabase project. NOT shipped as part of the app itself —
only used by tests/test_pipeline.py.
"""
import uuid
from copy import deepcopy


class _Result:
    def __init__(self, data, count=None):
        self.data = data
        self.count = count if count is not None else (len(data) if isinstance(data, list) else 0)


class _StorageBucket:
    def __init__(self):
        self.files = {}

    def upload(self, path, file_bytes, file_options=None):
        self.files[path] = file_bytes
        return {"path": path}

    def create_signed_url(self, path, expires_in=3600):
        return {"signedURL": f"https://fake.supabase.co/storage/{path}?token=fake"}


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
        self.neq_filters = []
        self.select_cols = "*"
        self.order_col = None
        self.order_desc = False
        self._op = None
        self._payload = None
        self._in_col = None
        self._in_values = None
        self._limit = None
        self._count = None

    def select(self, cols, count=None):
        self.select_cols = cols
        self._count = count
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

    def neq(self, col, val):
        self.neq_filters.append((col, val))
        return self

    def in_(self, col, values):
        self._in_col = col
        self._in_values = values
        return self

    def order(self, col, desc=False):
        self.order_col = col
        self.order_desc = desc
        return self

    def limit(self, num):
        self._limit = num
        return self

    def lt(self, col, val):
        return self

    def _matches(self, row):
        if not self._matches_filters(row):
            return False
        if not all(row.get(col) != val for col, val in self.neq_filters):
            return False
        if self._in_col and self._in_values is not None:
            return row.get(self._in_col) in self._in_values
        return True

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
                if self._matches(r):
                    r.update(deepcopy(self._payload) if isinstance(self._payload, dict) else self._payload)
                    updated.append(deepcopy(r))
            return _Result(updated)

        if self._op == "delete":
            to_delete = [r for r in rows if self._matches(r)]
            for r in to_delete:
                rows.remove(r)
            return _Result([r["id"] for r in to_delete])

        # select
        matched = [deepcopy(r) for r in rows if self._matches(r)]

        if "scores(*)" in self.select_cols:
            for r in matched:
                r["scores"] = [
                    deepcopy(s) for s in self.table.db.tables["scores"].rows
                    if s.get("candidate_id") == r["id"]
                ]

        if self.order_col:
            matched.sort(key=lambda r: r.get(self.order_col) or "", reverse=self.order_desc)

        total_count = len(matched)
        if self._limit is not None:
            matched = matched[:self._limit]

        return _Result(matched, count=total_count)


class _Table:
    def __init__(self, db, name):
        self.db = db
        self.name = name
        self.rows = []


ALL_TABLES = [
    "users", "companies", "jobs", "candidates", "scores",
    "chat_messages", "system_notifications", "candidate_profiles",
    "applications", "saved_jobs", "recruiter_profiles",
    "interviews", "interview_questions", "interview_answers",
    "conversations", "messages",
]


class FakeSupabase:
    def __init__(self):
        self.tables = {
            name: _Table(self, name)
            for name in ALL_TABLES
        }
        self.storage = _Storage()

    def table(self, name):
        return _Query(self.tables[name])

