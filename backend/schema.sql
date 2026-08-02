-- =============================================================================
-- TalentLens — Supabase Postgres Schema (Refactored & Extended)
-- Production schema supporting Users, Roles, Verification, Profiles & Applications.
-- =============================================================================

create extension if not exists pgcrypto; -- for gen_random_uuid()

-- ---------------------------------------------------------------------------
-- users: Authentication & Core User Profile
-- ---------------------------------------------------------------------------
create table if not exists users (
    id                   uuid primary key default gen_random_uuid(),
    first_name           text not null,
    last_name            text not null,
    email                text unique not null,
    password_hash        text not null,
    role                 text not null check (role in ('recruiter', 'candidate')),
    profile_picture      text,
    phone                text,
    is_verified          boolean default false,
    verification_code    text,
    verification_expiry  timestamptz,
    last_login           timestamptz,
    created_at           timestamptz default now(),
    updated_at           timestamptz default now()
);

create index if not exists idx_users_email on users(email);

-- ---------------------------------------------------------------------------
-- recruiter_profiles: Extended Recruiter Metadata
-- ---------------------------------------------------------------------------
create table if not exists recruiter_profiles (
    user_id       uuid primary key references users(id) on delete cascade,
    company_name  text not null,
    company_logo  text,
    website       text,
    company_size  text,
    industry      text,
    location      text,
    bio           text,
    created_at    timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- candidate_profiles: Extended Candidate Resume Metadata
-- ---------------------------------------------------------------------------
create table if not exists candidate_profiles (
    user_id         uuid primary key references users(id) on delete cascade,
    headline        text,
    summary         text,
    skills          jsonb,
    experience      text,
    education       text,
    certifications  text,
    resume_url      text,
    linkedin        text,
    github          text,
    portfolio       text,
    created_at      timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- jobs: Job Postings
-- ---------------------------------------------------------------------------
create table if not exists jobs (
    id              uuid primary key default gen_random_uuid(),
    created_by      uuid references users(id) on delete cascade,
    title           text not null,
    description     text not null,
    status          text default 'active' check (status in ('active', 'archived', 'closed')),
    created_at      timestamptz default now()
);

-- Existing TalentLens installations may have the original jobs table without
-- ownership metadata. Add it before creating the index so this script is safe
-- for both fresh projects and upgrades.
alter table jobs add column if not exists created_by uuid references users(id) on delete cascade;
alter table jobs add column if not exists status text not null default 'active';
create index if not exists idx_jobs_created_by on jobs(created_by);

-- ---------------------------------------------------------------------------
-- applications: Job Applications submitted by candidates
-- ---------------------------------------------------------------------------
create table if not exists applications (
    id            uuid primary key default gen_random_uuid(),
    candidate_id  uuid references users(id) on delete cascade,
    job_id        uuid references jobs(id) on delete cascade,
    status        text default 'Applied' check (status in ('Applied', 'Under Review', 'Shortlisted', 'Interview', 'Accepted', 'Rejected')),
    applied_at    timestamptz default now(),
    updated_at    timestamptz default now()
);

create index if not exists idx_applications_job_id on applications(job_id);
create index if not exists idx_applications_candidate_id on applications(candidate_id);

-- ---------------------------------------------------------------------------
-- candidates: Parsed resumes associated with jobs
-- ---------------------------------------------------------------------------
create table if not exists candidates (
    id               uuid primary key default gen_random_uuid(),
    job_id           uuid references jobs(id) on delete cascade,
    filename         text,
    name             text,
    email            text,
    phone            text,
    skills           jsonb,
    education        text,
    experience       text,
    certifications   text,
    projects         text,
    raw_text         text,
    resume_file_path text,
    created_at       timestamptz default now()
);

create index if not exists idx_candidates_job_id on candidates(job_id);

-- ---------------------------------------------------------------------------
-- scores: AI ranking evaluation scores
-- ---------------------------------------------------------------------------
create table if not exists scores (
    id                    uuid primary key default gen_random_uuid(),
    candidate_id          uuid references candidates(id) on delete cascade,
    job_id                uuid references jobs(id) on delete cascade,
    overall_score         numeric,
    skills_score          numeric,
    experience_score      numeric,
    education_score       numeric,
    certifications_score  numeric,
    projects_score        numeric,
    matched_skills        jsonb,
    missing_skills        jsonb,
    strengths             jsonb,
    weaknesses            jsonb,
    rank                  int,
    created_at            timestamptz default now()
);

create index if not exists idx_scores_candidate_id on scores(candidate_id);

-- ---------------------------------------------------------------------------
-- chat_messages: AI Assistant Chat History per job & user
-- ---------------------------------------------------------------------------
create table if not exists chat_messages (
    id          uuid primary key default gen_random_uuid(),
    job_id      uuid references jobs(id) on delete cascade,
    user_id     uuid references users(id) on delete cascade,
    role        text check (role in ('user', 'assistant')),
    content     text,
    created_at  timestamptz default now()
);

create index if not exists idx_chat_messages_job_id on chat_messages(job_id);

-- ---------------------------------------------------------------------------
-- system_notifications: System notifications for recruiters & candidates
-- ---------------------------------------------------------------------------
create table if not exists system_notifications (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid references users(id) on delete cascade,
    title       text not null,
    message     text not null,
    is_read     boolean default false,
    created_at  timestamptz default now()
);

create index if not exists idx_notifications_user_id on system_notifications(user_id);

-- =============================================================================
-- ATS expansion migration (safe to run after the original schema)
-- =============================================================================
-- The original prototype used first/last names and is_verified.  The API uses
-- a single full_name and email_verified, so retain old columns but make them
-- optional for backwards-compatible deployments.
alter table users add column if not exists full_name text;
alter table users add column if not exists email_verified boolean default false;
alter table users add column if not exists is_active boolean default true;
alter table users add column if not exists password_reset_code text;
alter table users add column if not exists password_reset_expiry timestamptz;
alter table users alter column first_name drop not null;
alter table users alter column last_name drop not null;
update users set full_name = coalesce(full_name, trim(concat_ws(' ', first_name, last_name))),
                 email_verified = coalesce(email_verified, is_verified, false);

create table if not exists companies (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references users(id) on delete cascade,
    company_name text not null,
    website text, logo text, description text, industry text, company_size text,
    address text, city text, country text,
    created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists idx_companies_owner on companies(owner_id);

alter table jobs add column if not exists recruiter_id uuid references users(id) on delete set null;
alter table jobs add column if not exists company_id uuid references companies(id) on delete set null;
alter table jobs add column if not exists status text not null default 'active';
alter table jobs add column if not exists employment_type text;
alter table jobs add column if not exists location text;
alter table jobs add column if not exists remote_type text;
alter table jobs add column if not exists salary_min numeric;
alter table jobs add column if not exists salary_max numeric;
alter table jobs add column if not exists experience_required text;
alter table jobs add column if not exists education_required text;
alter table jobs add column if not exists required_skills jsonb not null default '[]'::jsonb;
alter table jobs add column if not exists deadline timestamptz;
alter table jobs add column if not exists openings integer not null default 1;
alter table jobs add column if not exists updated_at timestamptz not null default now();
-- `user_id` belongs to the legacy Supabase Auth design. It remains intact;
-- recruiter_id/company_id are the ownership columns used by this ATS API.
create index if not exists idx_jobs_company_status on jobs(company_id, status);

alter table candidate_profiles add column if not exists parsed_resume_json jsonb;
alter table candidate_profiles add column if not exists resume_path text;
alter table candidate_profiles add column if not exists raw_text text;
alter table candidate_profiles add column if not exists profile_completion integer not null default 0;
alter table candidate_profiles add column if not exists updated_at timestamptz not null default now();

alter table applications add column if not exists cover_letter text;
alter table applications add column if not exists recruiter_notes text;
alter table applications add column if not exists candidate_resume_id uuid references candidates(id) on delete set null;
alter table applications add column if not exists score_id uuid references scores(id) on delete set null;
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'applications_candidate_job_unique'
  ) then
    alter table applications add constraint applications_candidate_job_unique unique(candidate_id, job_id);
  end if;
end $$;

alter table system_notifications add column if not exists type text not null default 'system';
alter table system_notifications add column if not exists resource_type text;
alter table system_notifications add column if not exists resource_id uuid;
alter table system_notifications add column if not exists read_at timestamptz;
create index if not exists idx_notifications_unread on system_notifications(user_id, is_read, created_at desc);

create table if not exists saved_jobs (
    user_id uuid not null references users(id) on delete cascade,
    job_id uuid not null references jobs(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (user_id, job_id)
);
create index if not exists idx_saved_jobs_user on saved_jobs(user_id, created_at desc);

-- =============================================================================
-- Gmail integration migration (safe to run after the original schema)
-- =============================================================================
-- Stores the OAuth token a recruiter grants for fetching resume attachments.
create table if not exists gmail_tokens (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    email text,
    access_token text,
    refresh_token text,
    token_expiry timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_gmail_tokens_user on gmail_tokens(user_id);

-- Candidates sourced from Gmail attachments carry provenance metadata plus the
-- job they were attached to, so the recruiter dashboard can filter them.
alter table candidates add column if not exists source text not null default 'manual';
alter table candidates add column if not exists gmail_message_id text;
alter table candidates add column if not exists gmail_sender text;
alter table candidates add column if not exists gmail_subject text;
alter table candidates add column if not exists gmail_folder text;
