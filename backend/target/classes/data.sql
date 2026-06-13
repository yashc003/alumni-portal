-- ============================================================
-- 🌱 data.sql — Database Seed Script
-- ============================================================
-- This file runs automatically every time the app starts
-- (because we set spring.sql.init.mode=always in application.properties).
--
-- PURPOSE: Create the first admin (Class Coordinator) account.
-- Without this, nobody could log into the admin panel to approve
-- other users — it's a chicken-and-egg problem!
--
-- The password below is "Admin@123" hashed with BCrypt.
-- BCrypt is a one-way hashing algorithm — you can't reverse it
-- to get the original password. Spring Security uses BCrypt to
-- securely store passwords (never store plain text passwords!).
--
-- DEFAULT ADMIN CREDENTIALS:
--   Email:    admin@portal.com
--   Password: Admin@123
-- ============================================================

-- The "WHERE NOT EXISTS" clause makes this IDEMPOTENT:
-- It only inserts if no admin account exists yet.
-- This way, running the script multiple times won't create duplicate admins.
INSERT INTO users (full_name, email, password_hash, role, account_status, batch_number, created_at, updated_at)
SELECT 'Class Coordinator', 'admin@portal.com',
       '$2a$10$EqKcp1WFKqGIVo9UR/cPfuDPh1PsHfBjx1ZxhP7v8JxqgXGQiJfam',
       'ROLE_ADMIN', 'APPROVED', 1,
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'ROLE_ADMIN'
);

-- ============================================================
-- 📺 Seed Default Chat Channels
-- ============================================================
-- Just like the admin user, we only insert these channels if
-- they don't already exist.

INSERT INTO channels (name, description, created_at)
SELECT 'general', 'General discussion for everyone', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM channels WHERE name = 'general');

-- ============================================================
-- 🛠️ Schema Fix: Drop NOT NULL on posted_by
-- ============================================================
-- In Phase 3, posted_by was required. Now that we have automated
-- scrapers, posted_by must be nullable. Hibernate won't drop existing
-- NOT NULL constraints, so we do it manually here. (Idempotent in Postgres)
ALTER TABLE job_posts ALTER COLUMN posted_by DROP NOT NULL;

-- Add Job Aggregation Engine fields without wiping data
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS relevance_score INTEGER DEFAULT 0;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS job_hash VARCHAR(64);
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS is_referral_available BOOLEAN DEFAULT FALSE;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS min_experience INTEGER;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS max_experience INTEGER;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS matched_skills TEXT;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS missing_skills TEXT;
