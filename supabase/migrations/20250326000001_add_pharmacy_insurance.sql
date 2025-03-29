-- Create pharmacy_refills table
CREATE TABLE pharmacy_refills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    prescription_id UUID,
    medication_name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insurance_providers table
CREATE TABLE insurance_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    provider_type TEXT CHECK (provider_type IN ('private', 'public', 'government')),
    contact_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insurance_claims table
CREATE TABLE insurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES insurance_providers(id),
    claim_number TEXT NOT NULL,
    claim_type TEXT CHECK (claim_type IN ('pharmacy', 'medical', 'dental', 'vision')),
    amount DECIMAL(10,2),
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    submission_date DATE,
    processed_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for pharmacy_refills
ALTER TABLE pharmacy_refills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_own_pharmacy_refills" ON pharmacy_refills
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

CREATE POLICY "insert_own_pharmacy_refills" ON pharmacy_refills
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_pharmacy_refills" ON pharmacy_refills
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for insurance_claims
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_own_insurance_claims" ON insurance_claims
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

CREATE POLICY "insert_own_insurance_claims" ON insurance_claims
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_insurance_claims" ON insurance_claims
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for insurance_providers
ALTER TABLE insurance_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_insurance_providers" ON insurance_providers
    FOR SELECT
    USING (true);

-- Create indexes for better performance
CREATE INDEX idx_pharmacy_refills_user_id ON pharmacy_refills(user_id);
CREATE INDEX idx_insurance_claims_user_id ON insurance_claims(user_id);
CREATE INDEX idx_insurance_claims_provider_id ON insurance_claims(provider_id); 