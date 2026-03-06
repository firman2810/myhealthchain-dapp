-- Migration: Add HOSPITAL_AUDITOR to users.role CHECK constraint
-- Date: 2026-03-05
-- Description: The original constraint only allowed PATIENT, DOCTOR, ADMIN.
--              Hibernate ddl-auto=update cannot update CHECK constraints automatically.

-- Step 1: Drop the old constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Recreate with the new role included
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK ((role)::text = ANY (
        ARRAY['PATIENT'::character varying,
              'DOCTOR'::character varying,
              'ADMIN'::character varying,
              'HOSPITAL_AUDITOR'::character varying]::text[]
    ));
