-- ═══════════════════════════════════════════════════════════
-- PrepPilot Database Schema
-- Run via: npm run db:setup
-- ═══════════════════════════════════════════════════════════

-- Enable UUID generation (required for gen_random_uuid on Postgres < 13)
-- On Postgres 13+ this is built-in, but the extension is harmless to add.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. USERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ─── 2. SESSIONS ──────────────────────────────────────────
-- Each session represents one 10-question mock interview.
-- current_provider tracks which AI is active (for failover).
CREATE TABLE IF NOT EXISTS sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  company_type      TEXT,       -- 'startup' | 'mnc' | 'faang'
  role_type         TEXT,       -- 'frontend' | 'backend' | 'fullstack' | 'dsa_focus'
  status            TEXT DEFAULT 'active',
  current_provider  TEXT DEFAULT 'claude',
  turn_count        INT DEFAULT 0,
  total_score       INT,
  created_at        TIMESTAMP DEFAULT NOW()
);

-- ─── 3. MESSAGES ──────────────────────────────────────────
-- Stores ALL conversation messages in NEUTRAL format.
-- role is always 'user', 'assistant', or 'summary' — never provider-specific.
-- superseded marks messages that have been compressed into a summary row.
CREATE TABLE IF NOT EXISTS messages (
  id            SERIAL PRIMARY KEY,
  session_id    UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role          TEXT,           -- 'user' | 'assistant' | 'summary'
  content       TEXT,
  tokens_used   INT,
  cached_tokens INT,
  provider      TEXT,
  superseded    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ─── 4. DSA PROBLEMS ─────────────────────────────────────
-- Tracks LeetCode problems fetched for DSA rounds (turns 2, 3, 4).
-- user_code and judge0_result store the student's submission + outcome.
CREATE TABLE IF NOT EXISTS dsa_problems (
  id             SERIAL PRIMARY KEY,
  session_id     UUID REFERENCES sessions(id) ON DELETE CASCADE,
  turn_number    INT,
  leetcode_slug  TEXT,
  title          TEXT,
  difficulty     TEXT,
  user_code      TEXT,
  language       TEXT,
  judge0_result  TEXT,
  passed         BOOLEAN,
  runtime_ms     INT,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- ─── 5. EVALUATIONS ──────────────────────────────────────
-- Per-question scoring extracted from AI's structured response.
-- Enables per-round breakdown in the final report.
CREATE TABLE IF NOT EXISTS evaluations (
  id              SERIAL PRIMARY KEY,
  session_id      UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question_number INT,
  question        TEXT,
  user_answer     TEXT,
  score           INT,
  feedback        TEXT,
  model_answer    TEXT,
  weak_areas      TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── 6. REPORTS ───────────────────────────────────────────
-- Generated when AI outputs "INTERVIEW_COMPLETE" after Q10.
-- Contains the full structured performance report.
CREATE TABLE IF NOT EXISTS reports (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID REFERENCES sessions(id) ON DELETE CASCADE,
  overall_score         INT,
  percentile            INT,
  intro_score           INT,
  dsa_score             INT,
  cs_score              INT,
  project_score         INT,
  hr_score              INT,
  strengths             TEXT,
  improvements          TEXT,
  hiring_recommendation TEXT,
  study_plan            TEXT,
  created_at            TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- INDEXES (for query performance on common lookups)
-- ═══════════════════════════════════════════════════════════

-- Fast session lookup by user (Dashboard page lists all sessions)
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Fast message lookup by session (chat history reconstruction)
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);

-- Filter out superseded messages efficiently
CREATE INDEX IF NOT EXISTS idx_messages_superseded ON messages(session_id, superseded);

-- DSA problems by session
CREATE INDEX IF NOT EXISTS idx_dsa_problems_session_id ON dsa_problems(session_id);

-- Evaluations by session
CREATE INDEX IF NOT EXISTS idx_evaluations_session_id ON evaluations(session_id);

-- Report lookup by session (1:1 relationship)
CREATE INDEX IF NOT EXISTS idx_reports_session_id ON reports(session_id);

-- User lookup by email (login queries)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
