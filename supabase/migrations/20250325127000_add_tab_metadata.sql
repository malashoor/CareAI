-- Add metadata columns to tab_configurations
ALTER TABLE tab_configurations
ADD COLUMN IF NOT EXISTS label_translations jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_tab_configurations_updated_at
  BEFORE UPDATE ON tab_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policy for updating tab configurations
CREATE POLICY "Allow admin to update tab configurations"
  ON tab_configurations
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE (raw_user_meta_data->>'is_admin')::boolean = true
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE (raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- Create function to revert tab configuration
CREATE OR REPLACE FUNCTION revert_tab_configuration(
  p_tab_id uuid,
  p_audit_log_id uuid
)
RETURNS void AS $$
DECLARE
  v_old_value jsonb;
  v_user_id uuid;
BEGIN
  -- Get the old value and user from audit log
  SELECT old_value, user_id INTO v_old_value, v_user_id
  FROM tab_config_audit_log
  WHERE id = p_audit_log_id AND tab_id = p_tab_id;

  IF v_old_value IS NULL THEN
    RAISE EXCEPTION 'Audit log entry not found';
  END IF;

  -- Update the tab configuration
  UPDATE tab_configurations
  SET
    title = v_old_value->>'title',
    icon = v_old_value->>'icon',
    roles = (v_old_value->'roles')::text[],
    isEnabled = (v_old_value->>'isEnabled')::boolean,
    updated_by = v_user_id
  WHERE id = p_tab_id;

  -- Log the revert action
  INSERT INTO tab_config_audit_log (
    tab_id,
    user_id,
    change_type,
    old_value,
    new_value
  ) VALUES (
    p_tab_id,
    v_user_id,
    'revert',
    v_old_value,
    (SELECT to_jsonb(tab_configurations.*) FROM tab_configurations WHERE id = p_tab_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 