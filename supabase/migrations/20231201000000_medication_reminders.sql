-- Create medication reminders table for scheduled notifications

-- Medication reminders table
CREATE TABLE public.medication_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  medication_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  reminder_type TEXT NOT NULL DEFAULT 'scheduled'
);

-- Index for querying due reminders
CREATE INDEX idx_medication_reminders_pending 
ON medication_reminders(scheduled_for) 
WHERE status = 'pending';

-- Index for user's reminders
CREATE INDEX idx_medication_reminders_user 
ON medication_reminders(user_id);

-- RLS Policies
ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;

-- Users can read their own reminders
CREATE POLICY "Users can read their own reminders" 
ON public.medication_reminders FOR SELECT
USING (user_id = auth.uid());

-- Add function to create recurring reminders
CREATE OR REPLACE FUNCTION create_recurring_medication_reminder(
  p_medication_id UUID,
  p_user_id UUID,
  p_medication_name TEXT,
  p_dosage TEXT,
  p_instructions TEXT,
  p_start_date TIMESTAMPTZ,
  p_recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
  p_recurrence_value INTEGER, -- e.g., 1 = every day, 2 = every other day
  p_times_per_day INTEGER,
  p_time_intervals INTEGER[] -- array of minutes from midnight, e.g., [480, 720, 1080] for 8am, 12pm, 6pm
)
RETURNS SETOF UUID AS $$
DECLARE
  v_current_date TIMESTAMPTZ := p_start_date;
  v_end_date TIMESTAMPTZ := p_start_date + INTERVAL '90 days'; -- Create 3 months worth of reminders
  v_time_of_day INTEGER;
  v_reminder_time TIMESTAMPTZ;
  v_reminder_id UUID;
BEGIN
  -- Loop through dates based on recurrence pattern
  WHILE v_current_date < v_end_date LOOP
    -- For each day, create reminders at specified times
    FOREACH v_time_of_day IN ARRAY p_time_intervals LOOP
      -- Calculate reminder time: current date + minutes from midnight
      v_reminder_time := DATE_TRUNC('day', v_current_date) + (v_time_of_day * INTERVAL '1 minute');
      
      -- Only create future reminders
      IF v_reminder_time > NOW() THEN
        -- Insert reminder
        INSERT INTO medication_reminders (
          medication_id,
          user_id,
          scheduled_for,
          medication_name,
          dosage,
          instructions,
          reminder_type
        ) VALUES (
          p_medication_id,
          p_user_id,
          v_reminder_time,
          p_medication_name,
          p_dosage,
          p_instructions,
          'recurring'
        ) RETURNING id INTO v_reminder_id;
        
        RETURN NEXT v_reminder_id;
      END IF;
    END LOOP;
    
    -- Advance to next date based on recurrence pattern
    IF p_recurrence_pattern = 'daily' THEN
      v_current_date := v_current_date + (p_recurrence_value * INTERVAL '1 day');
    ELSIF p_recurrence_pattern = 'weekly' THEN
      v_current_date := v_current_date + (p_recurrence_value * INTERVAL '1 week');
    ELSIF p_recurrence_pattern = 'monthly' THEN
      v_current_date := v_current_date + (p_recurrence_value * INTERVAL '1 month');
    ELSE
      -- Default to daily if invalid pattern
      v_current_date := v_current_date + INTERVAL '1 day';
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear all future reminders for a medication
CREATE OR REPLACE FUNCTION clear_future_medication_reminders(
  p_medication_id UUID,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM medication_reminders
  WHERE medication_id = p_medication_id
    AND user_id = p_user_id
    AND scheduled_for > NOW()
    AND status = 'pending'
  RETURNING COUNT(*) INTO v_count;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 