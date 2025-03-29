/*
  # Add forwarded messages support

  1. New Tables
    - `forwarded_messages`
      - `id` (uuid, primary key)
      - `original_message_id` (uuid, references voice_messages)
      - `from_user_id` (uuid, references profiles)
      - `to_user_id` (uuid, references profiles)
      - `notes` (text)
      - `priority` (text)
      - `created_at` (timestamp)

  2. Changes
    - Add `context` column to voice_messages table
    - Add `priority` column to voice_messages table

  3. Security
    - Enable RLS on new table
    - Add policies for forwarding messages
*/

-- Add new columns to voice_messages
ALTER TABLE voice_messages
ADD COLUMN context jsonb DEFAULT NULL,
ADD COLUMN priority text CHECK (priority IN ('normal', 'urgent', 'emergency')) DEFAULT 'normal';

-- Create forwarded_messages table
CREATE TABLE IF NOT EXISTS forwarded_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_message_id uuid REFERENCES voice_messages(id),
  from_user_id uuid REFERENCES profiles(id),
  to_user_id uuid REFERENCES profiles(id),
  notes text,
  priority text CHECK (priority IN ('normal', 'urgent', 'emergency')) DEFAULT 'normal',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE forwarded_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for forwarded_messages
CREATE POLICY "Users can read forwarded messages sent to them"
  ON forwarded_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = to_user_id OR
    auth.uid() = from_user_id
  );

CREATE POLICY "Users can forward messages"
  ON forwarded_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = from_user_id AND
    EXISTS (
      SELECT 1 FROM connected_users
      WHERE (
        (user_id = auth.uid() AND connected_user_id = to_user_id) OR
        (connected_user_id = auth.uid() AND user_id = to_user_id)
      )
      AND (
        relationship IN ('child', 'medical')
      )
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forwarded_messages_to_user 
ON forwarded_messages(to_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forwarded_messages_from_user 
ON forwarded_messages(from_user_id, created_at DESC);