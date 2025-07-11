# CareAI Database Schema Conventions

## 🎯 Core Principles

1. **Consistency**: Follow these conventions strictly for maintainability
2. **Type Safety**: Use proper types, especially for IDs and references
3. **Security**: Enable RLS on all tables with proper policies
4. **Auditability**: Include audit fields on all tables

## 📝 Naming Conventions

### Tables

- Use `snake_case`
- Use plural form for collections (e.g., `medications`, not `medication`)
- Prefix junction tables with both entity names (e.g., `user_medications`)
- Suffix audit/log tables with `_logs` or `_history`
- Examples:
  ```sql
  medications
  medication_refills
  user_preferences
  audit_logs
  ```

### Columns

#### ID Columns
- **Primary Keys**: Always named `id` and use `UUID` type
- **Foreign Keys**: 
  - Use `<entity>_id` format
  - Always use `UUID` type
  - Examples: `user_id`, `medication_id`, `prescriber_id`

#### Common Fields
- `created_at`: `TIMESTAMPTZ` with `DEFAULT NOW()`
- `updated_at`: `TIMESTAMPTZ` with `DEFAULT NOW()`
- `deleted_at`: `TIMESTAMPTZ` (for soft deletes)
- `created_by`: `UUID REFERENCES profiles(id)`
- `updated_by`: `UUID REFERENCES profiles(id)`

#### Status/Type Fields
- Use `status` for state (e.g., `active`, `pending`, `completed`)
- Use `type` for categorization
- Consider using ENUMs for fixed sets of values

## 🔑 ID Column Standards

### UUID Type Requirements
- All `id` columns MUST be `UUID` type
- All `user_id` columns MUST be `UUID` type and reference `public.profiles(id)`
- All columns ending in `_id` MUST be `UUID` type and have a foreign key constraint

### Foreign Key Rules
1. **Always** include foreign key constraints
2. **Always** reference the correct table and column
3. **Never** use `TEXT` or other types for ID columns
4. **Always** drop and recreate FK constraints when modifying column types

## 🛠 Schema Management Tools

### Schema Health Check
```sql
-- Run this to check schema health:
SELECT * FROM public.schema_health_check;
-- Or use the function:
SELECT * FROM check_schema_health();
```

### Type Conversion Helper
```sql
-- Safe UUID conversion function:
CREATE OR REPLACE FUNCTION try_cast_to_uuid(p_input text)
RETURNS uuid AS $$
BEGIN
  RETURN p_input::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## 🔒 RLS (Row Level Security)

### Requirements
1. All tables must have RLS enabled
2. All tables must have appropriate policies
3. Use `auth.uid()::uuid` for user context in policies
4. Verify using the `rls_check` view

## 📋 Migration Checklist

When creating new migrations:

- [ ] Use `UUID` for all ID columns
- [ ] Include foreign key constraints
- [ ] Enable RLS
- [ ] Add appropriate RLS policies
- [ ] Test with `schema_health_check`
- [ ] Run `launch-audit` script

## 🚨 Common Issues & Solutions

### Type Mismatch Fix Template
```sql
-- 1. Drop existing constraint
ALTER TABLE public.your_table 
  DROP CONSTRAINT IF EXISTS your_table_user_id_fkey;

-- 2. Convert column type
ALTER TABLE public.your_table 
  ALTER COLUMN user_id TYPE UUID 
  USING try_cast_to_uuid(user_id);

-- 3. Add new constraint
ALTER TABLE public.your_table 
  ADD CONSTRAINT your_table_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);
```

## 🔍 Monitoring & Verification

### CI/CD Checks
1. Run `schema_health_check` before builds
2. Verify RLS policies are in place
3. Ensure all foreign keys are properly typed
4. Check for missing constraints

### Manual Verification
```bash
# Full verification suite
npm run verify:rls && npm run audit:launch && npm run build
```

## 📊 Admin Dashboard
Access the schema health dashboard at:
`/admin/schema-health`

## 🆘 Emergency Fixes

If you encounter type mismatches:
1. Use the type conversion template above
2. Always backup data before converting
3. Use `try_cast_to_uuid()` for safe conversion
4. Verify with `schema_health_check`
5. Run the full verification suite

## 🎯 Best Practices Summary

1. **ALWAYS** use UUID for ID columns
2. **ALWAYS** include foreign key constraints
3. **ALWAYS** enable and verify RLS
4. **NEVER** skip schema health checks
5. **ALWAYS** run the full verification suite before deployment

## 🚫 Common Anti-patterns to Avoid

1. ❌ Using `TEXT` for ID columns
2. ❌ Missing foreign key constraints
3. ❌ Inconsistent column naming
4. ❌ Missing RLS policies
5. ❌ Missing audit fields
6. ❌ Missing indexes on frequently queried columns
7. ❌ Not using proper types (e.g., using TEXT for dates)

## 📋 Pre-commit Checklist

- [ ] All ID columns are `UUID`
- [ ] Foreign keys are properly constrained
- [ ] RLS is enabled
- [ ] Appropriate policies are in place
- [ ] Audit fields are present
- [ ] Indexes are added for performance
- [ ] Schema health check passes

## 🔄 Migration Best Practices

1. **Naming**: Use timestamp prefix: `YYYYMMDDHHMMSS_descriptive_name.sql`
2. **Idempotency**: Use `IF NOT EXISTS` / `IF EXISTS`
3. **Reversibility**: Include `DOWN` migration when possible
4. **Atomicity**: One logical change per migration
5. **Safety**: Add appropriate constraints and validations

## 🔑 Core Principles

1. **UUID Usage**
   - All primary keys are UUIDs
   - Foreign keys must match UUID format
   - Use `uuid_generate_v4()` for new records

2. **Timestamps**
   - All tables include `created_at` timestamp
   - Use `updated_at` for user-editable tables
   - Store all times in UTC

3. **Soft Deletion**
   - Use `deleted_at` timestamp
   - Never physically delete user data
   - RLS policies respect soft deletion

## 📋 Table Structure

### User Management
- `profiles`
  - Core user information
  - Email must be unique
  - Phone numbers in E.164 format

- `connected_users`
  - Links seniors with children/doctors
  - Enforces relationship types
  - Maintains connection history

### Health Monitoring
- `health_metrics`
  - Stores vital signs and measurements
  - Supports multiple metric types
  - Includes timestamp and notes

- `cognitive_exercises`
  - Exercise templates and instructions
  - Categorized by difficulty
  - Linked to progress tracking

- `cognitive_progress`
  - User exercise completion records
  - Stores scores and timing
  - Tracks improvement over time

### Reminders & Notifications
- `reminders`
  - Medication and appointment reminders
  - Supports recurring schedules
  - Includes completion tracking

- `notifications`
  - Push notification records
  - Delivery status tracking
  - Links to source events

- `notification_failures`
  - Error tracking and retry info
  - Device token management
  - Helps improve delivery rates

### Emergency Features
- `emergency_contacts`
  - Prioritized contact list
  - Multiple contact methods
  - Relationship tracking

### Voice & Accessibility
- `voice_preferences`
  - Language settings
  - Voice speed and pitch
  - Text-to-speech configs

### Audit & Security
- `audit_logs`
  - Security-relevant actions
  - User session tracking
  - Emergency trigger records

## 🔒 Row Level Security (RLS)

### Default Policies
1. Users can only read their own data
2. Connected users can read senior's data
3. Doctors have limited write access
4. Admin roles have full access

### Policy Naming
- `{table}_select_policy`
- `{table}_insert_policy`
- `{table}_update_policy`
- `{table}_delete_policy`

## 📊 Data Types

### Standard Types
- Text: `VARCHAR(255)` or `TEXT`
- Numbers: `INTEGER` or `DECIMAL(10,2)`
- Dates: `TIMESTAMP WITH TIME ZONE`
- Booleans: `BOOLEAN`
- IDs: `UUID`

### Enums
- Relationship types: `'child', 'doctor'`
- Metric types: `'blood_pressure', 'blood_sugar', 'pulse', 'hydration', 'sleep_hours'`
- Reminder types: `'medication', 'hydration', 'medical', 'exercise'`
- Notification types: `'reminder', 'alert', 'sos'`

## 🔄 Migrations

### Naming Convention
```sql
YYYYMMDDHHMMSS_descriptive_name.sql
```

### Structure
```sql
-- Description: Brief explanation
-- Up: Main migration
-- Down: Rollback steps
```

## 📝 Comments & Documentation

### Table Comments
```sql
COMMENT ON TABLE table_name IS 'Purpose and usage';
```

### Column Comments
```sql
COMMENT ON COLUMN table_name.column_name IS 'Description';
```

## ⚡️ Performance

### Indexes
- Primary keys: Automatic UUID index
- Foreign keys: Always indexed
- Frequently queried columns
- Composite indexes for common queries

### Constraints
- NOT NULL where appropriate
- CHECK constraints for enums
- UNIQUE for email, phone
- Foreign key with CASCADE options

## 🔍 Monitoring

### Health Checks
```sql
SELECT schemaname, tablename, n_live_tup 
FROM pg_stat_user_tables;
```

### RLS Verification
```sql
SELECT tablename, hasrls 
FROM pg_tables 
WHERE schemaname = 'public';
```

## 🚨 Common Issues

1. **UUID Mismatch**
   - Ensure consistent UUID format
   - Use proper type casting
   - Validate before insert

2. **Timestamp Zones**
   - Always use `WITH TIME ZONE`
   - Store in UTC
   - Convert in application

3. **RLS Failures**
   - Check user role
   - Verify policy syntax
   - Test with multiple users

## 📚 References

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [UUID Generation](https://www.postgresql.org/docs/current/uuid-ossp.html)
- [RLS Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) 