-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add national ID fields to profiles
ALTER TABLE profiles
ADD COLUMN national_id_encrypted TEXT,
ADD COLUMN national_id_country TEXT,
ADD COLUMN national_id_updated_at TIMESTAMP WITH TIME ZONE;

-- Create audit_log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_field_name CHECK (field_name IN ('national_id', 'national_id_country'))
);

-- Create function for audit logging
CREATE OR REPLACE FUNCTION log_field_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        IF (OLD.national_id_encrypted IS DISTINCT FROM NEW.national_id_encrypted) THEN
            INSERT INTO audit_log (user_id, field_name, old_value, new_value)
            VALUES (NEW.id, 'national_id', OLD.national_id_encrypted, NEW.national_id_encrypted);
        END IF;
        
        IF (OLD.national_id_country IS DISTINCT FROM NEW.national_id_country) THEN
            INSERT INTO audit_log (user_id, field_name, old_value, new_value)
            VALUES (NEW.id, 'national_id_country', OLD.national_id_country, NEW.national_id_country);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit logging
CREATE TRIGGER profile_field_change_trigger
    AFTER UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_field_change();

-- Create function for national ID validation
CREATE OR REPLACE FUNCTION validate_national_id(
    id TEXT,
    country TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    -- Saudi Arabia validation (10 digits)
    IF country = 'SA' THEN
        RETURN id ~ '^[0-9]{10}$';
    END IF;
    
    -- Default validation (alphanumeric, 5-20 characters)
    RETURN id ~ '^[a-zA-Z0-9]{5,20}$';
END;
$$ LANGUAGE plpgsql;

-- Create function for national ID encryption
CREATE OR REPLACE FUNCTION encrypt_national_id(
    id TEXT,
    user_id UUID
) RETURNS TEXT AS $$
BEGIN
    -- Use user_id as part of the encryption key for additional security
    RETURN encrypt(id::bytea, user_id::text::bytea, 'aes');
END;
$$ LANGUAGE plpgsql;

-- Create function for national ID decryption
CREATE OR REPLACE FUNCTION decrypt_national_id(
    encrypted_id TEXT,
    user_id UUID
) RETURNS TEXT AS $$
BEGIN
    RETURN decrypt(encrypted_id::bytea, user_id::text::bytea, 'aes')::text;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for viewing national ID (owner, children, and assigned professionals)
CREATE POLICY "view_national_id" ON profiles
    FOR SELECT
    USING (
        auth.uid() = id OR
        id IN (
            SELECT child_id FROM family_connections 
            WHERE parent_id = auth.uid()
        ) OR
        id IN (
            SELECT user_id FROM professional_assignments 
            WHERE professional_id = auth.uid()
        )
    );

-- Policy for updating national ID (owner only)
CREATE POLICY "update_national_id" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        validate_national_id(
            decrypt_national_id(NEW.national_id_encrypted, NEW.id),
            NEW.national_id_country
        )
    );

-- Add RLS policies for audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_own_audit_logs" ON audit_log
    FOR SELECT
    USING (
        auth.uid() = user_id OR
        user_id IN (
            SELECT child_id FROM family_connections 
            WHERE parent_id = auth.uid()
        ) OR
        user_id IN (
            SELECT user_id FROM professional_assignments 
            WHERE professional_id = auth.uid()
        )
    ); 