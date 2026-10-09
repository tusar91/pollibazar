-- ============================================================================
-- Migration 0003: Setup Admin and Moderator Accounts with Role-Based Access
-- Database: pollibazar-db | Binding: DB
-- ============================================================================

-- 1. Ensure production Admin account exists with specified password
-- Username: admin
-- Password: Tt0171718411688727
-- Hash: pbdevsalt2026:2240fde2ce7fe263c486076ac52389fc95f11f88a98956716fd58f1bbac9c575
-- Role: admin
INSERT INTO admins (id, username, password_hash, role)
VALUES ('adm-01', 'admin', 'pbdevsalt2026:2240fde2ce7fe263c486076ac52389fc95f11f88a98956716fd58f1bbac9c575', 'admin')
ON CONFLICT(username) DO UPDATE SET
  password_hash = 'pbdevsalt2026:2240fde2ce7fe263c486076ac52389fc95f11f88a98956716fd58f1bbac9c575',
  role = 'admin';

-- 2. Ensure production Moderator account exists with specified password
-- Username: moderator
-- Password: 01717184116
-- Hash: pbdevsalt2026:c08c589c7588769519b782ca579c0aaddaa6d5869cfaa70875c69969c794be93
-- Role: moderator
INSERT INTO admins (id, username, password_hash, role)
VALUES ('adm-02', 'moderator', 'pbdevsalt2026:c08c589c7588769519b782ca579c0aaddaa6d5869cfaa70875c69969c794be93', 'moderator')
ON CONFLICT(username) DO UPDATE SET
  password_hash = 'pbdevsalt2026:c08c589c7588769519b782ca579c0aaddaa6d5869cfaa70875c69969c794be93',
  role = 'moderator';

-- 3. Clear existing sessions to enforce fresh authentication with new credentials
DELETE FROM sessions WHERE admin_id IN (SELECT id FROM admins WHERE username IN ('admin', 'moderator'));
