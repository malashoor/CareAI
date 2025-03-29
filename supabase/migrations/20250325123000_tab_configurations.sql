-- Create tab_configurations table
CREATE TABLE IF NOT EXISTS tab_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  icon text NOT NULL,
  order integer NOT NULL,
  roles text[] NOT NULL,
  isEnabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default tab configurations
INSERT INTO tab_configurations (name, title, icon, order, roles, isEnabled) VALUES
  -- Senior tabs
  ('index', 'Home', 'home', 1, ARRAY['senior'], true),
  ('health', 'Health', 'heart', 2, ARRAY['senior'], true),
  ('cognitive', 'Mind', 'brain', 3, ARRAY['senior'], true),
  ('monitoring', 'Safety', 'shield', 4, ARRAY['senior'], true),
  
  -- Family Member tabs
  ('index', 'Overview', 'activity', 1, ARRAY['child'], true),
  ('monitoring', 'Monitor', 'shield', 2, ARRAY['child'], true),
  ('chat', 'Messages', 'message-square', 3, ARRAY['child'], true),
  ('alerts', 'Alerts', 'bell', 4, ARRAY['child'], true),
  
  -- Healthcare Professional tabs
  ('index', 'Dashboard', 'stethoscope', 1, ARRAY['medical'], true),
  ('appointments', 'Schedule', 'calendar', 2, ARRAY['medical'], true),
  ('patients', 'Patients', 'users', 3, ARRAY['medical'], true),
  ('chat', 'Consult', 'message-square', 4, ARRAY['medical'], true),
  
  -- Common tabs
  ('settings', 'Settings', 'settings', 5, ARRAY['senior', 'child', 'medical'], true);

-- Add RLS policies
ALTER TABLE tab_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all authenticated users"
  ON tab_configurations
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_tab_configurations_roles ON tab_configurations USING gin (roles);
CREATE INDEX idx_tab_configurations_order ON tab_configurations (order); 