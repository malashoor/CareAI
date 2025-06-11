-- Add webhook support for notifications

-- Webhook endpoints table
CREATE TABLE public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  user_id UUID REFERENCES auth.users(id),
  headers JSONB
);

-- Create trigger to update timestamp
CREATE TRIGGER set_webhook_endpoints_updated_at
BEFORE UPDATE ON public.webhook_endpoints
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- Webhook delivery queue
CREATE TABLE public.webhook_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  webhook_id UUID NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  last_response JSONB,
  last_status_code INTEGER,
  error TEXT
);

-- Create index for processing pending webhook deliveries
CREATE INDEX idx_webhook_queue_pending 
ON webhook_queue(next_retry_at) 
WHERE status = 'pending';

-- Create index for webhook history
CREATE INDEX idx_webhook_queue_notification 
ON webhook_queue(notification_id);

-- RLS Policies
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- Admin can read all webhook endpoints
CREATE POLICY "Admin can read all webhook endpoints" 
ON public.webhook_endpoints FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Users can read their own webhook endpoints
CREATE POLICY "Users can read their own webhook endpoints" 
ON public.webhook_endpoints FOR SELECT
USING (user_id = auth.uid());

-- Admin can create webhook endpoints
CREATE POLICY "Admin can create webhook endpoints" 
ON public.webhook_endpoints FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Admin can update webhook endpoints
CREATE POLICY "Admin can update webhook endpoints" 
ON public.webhook_endpoints FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin');

-- Admin can delete webhook endpoints
CREATE POLICY "Admin can delete webhook endpoints" 
ON public.webhook_endpoints FOR DELETE
USING (auth.jwt() ->> 'role' = 'admin');

-- Function to calculate exponential backoff
CREATE OR REPLACE FUNCTION calculate_exponential_backoff(retry_count INTEGER)
RETURNS INTERVAL AS $$
DECLARE
  base_delay INTERVAL := '30 seconds';
  max_delay INTERVAL := '24 hours';
  jitter DOUBLE PRECISION;
  delay INTERVAL;
BEGIN
  -- Base delay with exponential backoff: 30s, 1m, 2m, 4m, 8m, 16m, 32m, 1h, 2h, 4h, 8h, 16h, 24h
  IF retry_count > 12 THEN
    delay := max_delay;
  ELSE
    -- 2^retry_count * base_delay (in seconds)
    delay := (POWER(2, retry_count)::INTEGER * EXTRACT(EPOCH FROM base_delay) * INTERVAL '1 second');
    
    -- Cap at max_delay
    IF delay > max_delay THEN
      delay := max_delay;
    END IF;
  END IF;
  
  -- Add random jitter (±20%)
  jitter := 0.8 + random() * 0.4; -- between 0.8 and 1.2
  delay := delay * jitter;
  
  RETURN delay;
END;
$$ LANGUAGE plpgsql VOLATILE; 