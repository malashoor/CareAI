-- Create enum for status
CREATE TYPE gifted_user_status AS ENUM ('pending', 'invited', 'accepted', 'expired');

-- Create gifted_users table
CREATE TABLE gifted_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    region TEXT NOT NULL,
    charity_name TEXT,
    note TEXT,
    status gifted_user_status NOT NULL DEFAULT 'pending',
    gifted_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_gifted_users_status ON gifted_users(status);
CREATE INDEX idx_gifted_users_gifted_by ON gifted_users(gifted_by);

-- Enable RLS
ALTER TABLE gifted_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can do everything" ON gifted_users
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role = 'admin'
        )
    );

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_gifted_users_updated_at
    BEFORE UPDATE ON gifted_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 