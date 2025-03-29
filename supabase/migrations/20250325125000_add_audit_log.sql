-- Create audit log table
CREATE TABLE IF NOT EXISTS tab_config_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id uuid NOT NULL REFERENCES tab_configurations(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  change_type text NOT NULL, -- 'role_update', 'enable_toggle', 'label_update', 'icon_update'
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add RLS policy for audit log
ALTER TABLE tab_config_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin access to audit log"
  ON tab_config_audit_log
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE (raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- Create function to log changes
CREATE OR REPLACE FUNCTION log_tab_config_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Log role changes
    IF OLD.roles IS DISTINCT FROM NEW.roles THEN
      INSERT INTO tab_config_audit_log (tab_id, user_id, change_type, old_value, new_value)
      VALUES (
        NEW.id,
        auth.uid(),
        'role_update',
        jsonb_build_object('roles', OLD.roles),
        jsonb_build_object('roles', NEW.roles)
      );
    END IF;

    -- Log enable/disable changes
    IF OLD.isEnabled IS DISTINCT FROM NEW.isEnabled THEN
      INSERT INTO tab_config_audit_log (tab_id, user_id, change_type, old_value, new_value)
      VALUES (
        NEW.id,
        auth.uid(),
        'enable_toggle',
        jsonb_build_object('isEnabled', OLD.isEnabled),
        jsonb_build_object('isEnabled', NEW.isEnabled)
      );
    END IF;

    -- Log label changes
    IF OLD.title IS DISTINCT FROM NEW.title THEN
      INSERT INTO tab_config_audit_log (tab_id, user_id, change_type, old_value, new_value)
      VALUES (
        NEW.id,
        auth.uid(),
        'label_update',
        jsonb_build_object('title', OLD.title),
        jsonb_build_object('title', NEW.title)
      );
    END IF;

    -- Log icon changes
    IF OLD.icon IS DISTINCT FROM NEW.icon THEN
      INSERT INTO tab_config_audit_log (tab_id, user_id, change_type, old_value, new_value)
      VALUES (
        NEW.id,
        auth.uid(),
        'icon_update',
        jsonb_build_object('icon', OLD.icon),
        jsonb_build_object('icon', NEW.icon)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for logging changes
DROP TRIGGER IF EXISTS on_tab_config_change ON tab_configurations;
CREATE TRIGGER on_tab_config_change
  AFTER UPDATE ON tab_configurations
  FOR EACH ROW
  EXECUTE FUNCTION log_tab_config_change(); 