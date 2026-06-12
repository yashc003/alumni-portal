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

INSERT INTO channels (name, description, created_at)
SELECT 'jobs', 'Job referrals and career advice', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM channels WHERE name = 'jobs');

INSERT INTO channels (name, description, created_at)
SELECT 'batch-2024', 'Specific chat for the 2024 graduating batch', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM channels WHERE name = 'batch-2024');
