-- ============================================================================
-- Migration 0004: Backward-compatible column addition for products
-- Database: pollibazar-db | Binding: DB
-- ============================================================================
-- 
-- RATIONALE:
-- The application code has now been updated to query the existing production schema
-- (using the existing `status` and `stock` columns) so that checkouts, product queries,
-- and admin features work immediately without errors.
--
-- If you wish to explicitly add `is_available` to the products table in D1 for future
-- direct boolean filtering, this migration safely adds it with DEFAULT 1 without
-- modifying or deleting any existing product records.
--
-- DO NOT RUN UNTIL APPROVED BY USER:
-- To execute when approved:
--   npx wrangler d1 execute pollibazar-db --remote --file=migrations/0004_add_is_available_to_products.sql

ALTER TABLE products ADD COLUMN is_available BOOLEAN DEFAULT 1;
