-- Migration 0002: Update existing admin password and clean sample/demo customer & delivery data
-- Database: pollibazar-db | ID: c5cc8d6a-cb1c-44b9-a8d1-b39b364aa950 | Binding: DB

-- 1. Update existing admin account password to new password: Tt0171718411688727
-- Stored as secure Web Crypto SHA-256 hash with salt 'pbdevsalt2026'
UPDATE admins 
SET password_hash = 'pbdevsalt2026:2240fde2ce7fe263c486076ac52389fc95f11f88a98956716fd58f1bbac9c575' 
WHERE username = 'admin';

-- 2. Invalidate any active sessions for the admin to enforce a fresh login with the new password
DELETE FROM sessions 
WHERE admin_id IN (SELECT id FROM admins WHERE username = 'admin');

-- 3. Remove old sample/demo customer, order, and delivery records to start from a clean state
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM customers;
