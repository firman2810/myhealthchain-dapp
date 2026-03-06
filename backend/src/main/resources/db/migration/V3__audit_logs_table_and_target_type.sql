-- Migration V3: Ensure audit_logs table exists and add target_type column
-- Also update audit_logs status constraint for FAIL, and users role constraint.
-- Date: 2026-03-06

-- 1. Create audit_logs table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGSERIAL     PRIMARY KEY,
    timestamp       TIMESTAMP     NOT NULL,
    doctor_name     VARCHAR(255)  NOT NULL,
    doctor_id       VARCHAR(255)  NOT NULL,
    action          VARCHAR(50)   NOT NULL,
    target_type     VARCHAR(50),
    patient_ref     VARCHAR(255)  NOT NULL,
    status          VARCHAR(50)   NOT NULL,
    organization_id BIGINT        NOT NULL
);

-- 2. Add target_type column if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'target_type'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN target_type VARCHAR(50);
    END IF;
END $$;

-- 3. Drop and recreate audit_logs status constraint to allow FAIL
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_status_check;

-- 4. Drop and recreate users role constraint (in case V2 wasn't applied)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK ((role)::text = ANY (
        ARRAY['PATIENT', 'DOCTOR', 'ADMIN', 'HOSPITAL_AUDITOR']::text[]
    ));

-- 5. Create index for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_timestamp
    ON audit_logs (organization_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_action
    ON audit_logs (organization_id, action);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_status
    ON audit_logs (organization_id, status);
