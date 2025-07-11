#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}CareAI Notification System Cleanup${NC}"
echo "-------------------------------------------"

# Check for required environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo -e "${YELLOW}Missing Supabase environment variables.${NC}"
  echo "Please ensure the following environment variables are set:"
  echo "  - SUPABASE_URL"
  echo "  - SUPABASE_SERVICE_KEY"
  exit 1
fi

# Default retention period in days (can be overridden with command-line argument)
RETENTION_PERIOD=${1:-30}

echo -e "${YELLOW}Running cleanup with ${RETENTION_PERIOD} days retention period...${NC}"

# Execute cleanup SQL
cleanup_sql="
-- Archive and delete old notifications
WITH archived_notifications AS (
  INSERT INTO notifications_archive (
    SELECT * FROM notifications
    WHERE created_at < NOW() - INTERVAL '$RETENTION_PERIOD days'
    AND status IN ('delivered', 'failed', 'dismissed')
  )
  RETURNING id
),
notification_count AS (
  SELECT COUNT(*) as count FROM archived_notifications
),
deleted_notifications AS (
  DELETE FROM notifications
  WHERE id IN (SELECT id FROM archived_notifications)
  RETURNING id
),
deleted_webhooks AS (
  DELETE FROM webhook_queue
  WHERE created_at < NOW() - INTERVAL '$RETENTION_PERIOD days'
  AND status IN ('delivered', 'failed', 'skipped')
  RETURNING id
),
webhook_count AS (
  SELECT COUNT(*) as count FROM deleted_webhooks
)
SELECT
  (SELECT count FROM notification_count) as archived_notifications,
  (SELECT COUNT(*) FROM deleted_notifications) as deleted_notifications,
  (SELECT count FROM webhook_count) as deleted_webhooks;
"

# Run the SQL query
PGSSLMODE=require psql "$SUPABASE_URL" -U postgres -c "$cleanup_sql" -t

# Check status
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Cleanup completed successfully${NC}"
else
  echo -e "${RED}❌ Cleanup failed${NC}"
  exit 1
fi

echo "-------------------------------------------"
echo -e "${YELLOW}Additional maintenance tasks:${NC}"
echo "1. Running VACUUM ANALYZE on notification tables..."

vacuum_sql="
VACUUM ANALYZE notifications;
VACUUM ANALYZE notifications_archive;
VACUUM ANALYZE webhook_queue;
"

PGSSLMODE=require psql "$SUPABASE_URL" -U postgres -c "$vacuum_sql" -t

echo -e "${GREEN}✅ All maintenance tasks completed${NC}"
echo "-------------------------------------------" 