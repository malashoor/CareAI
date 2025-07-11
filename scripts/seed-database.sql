-- Reset Database (uncomment if needed)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean existing data
TRUNCATE TABLE profiles CASCADE;
TRUNCATE TABLE connected_users CASCADE;
TRUNCATE TABLE reminders CASCADE;
TRUNCATE TABLE health_metrics CASCADE;
TRUNCATE TABLE cognitive_exercises CASCADE;
TRUNCATE TABLE cognitive_progress CASCADE;
TRUNCATE TABLE emergency_contacts CASCADE;
TRUNCATE TABLE voice_preferences CASCADE;
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE notification_failures CASCADE;

-- Test UUIDs for consistent referencing
DO $$ 
BEGIN
    -- Create test users
    INSERT INTO profiles (id, email, full_name, phone_number, photo_url, created_at, updated_at)
    VALUES 
        ('11111111-1111-1111-1111-111111111111', 'senior@careai.com', 'John Senior', '+1234567890', 'https://careai-photos.com/senior.jpg', NOW(), NOW()),
        ('22222222-2222-2222-2222-222222222222', 'child@careai.com', 'Mary Child', '+1234567891', 'https://careai-photos.com/child.jpg', NOW(), NOW()),
        ('33333333-3333-3333-3333-333333333333', 'doctor@careai.com', 'Dr. Smith', '+1234567892', 'https://careai-photos.com/doctor.jpg', NOW(), NOW());

    -- Connect users (child and doctor to senior)
    INSERT INTO connected_users (senior_id, connected_user_id, relationship_type, created_at)
    VALUES 
        ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'child', NOW()),
        ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'doctor', NOW());

    -- Add reminders
    INSERT INTO reminders (id, user_id, title, description, reminder_time, reminder_type, status, created_at)
    VALUES 
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Blood Pressure Medicine', 'Take 1 tablet of Lisinopril', NOW() + INTERVAL '1 day', 'medication', 'pending', NOW()),
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Water Intake', 'Drink 1 glass of water', NOW() + INTERVAL '2 hours', 'hydration', 'pending', NOW()),
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Doctor Appointment', 'Regular checkup with Dr. Smith', NOW() + INTERVAL '7 days', 'medical', 'pending', NOW()),
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Evening Medicine', 'Take diabetes medication', NOW() + INTERVAL '12 hours', 'medication', 'pending', NOW()),
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Exercise Time', '15 minutes of light walking', NOW() + INTERVAL '4 hours', 'exercise', 'pending', NOW());

    -- Add health metrics
    INSERT INTO health_metrics (id, user_id, metric_type, value, recorded_at, notes, created_at)
    VALUES 
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'blood_pressure', '120/80', NOW() - INTERVAL '1 day', 'Morning reading', NOW()),
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'blood_sugar', '95', NOW() - INTERVAL '1 day', 'Before breakfast', NOW()),
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'pulse', '72', NOW() - INTERVAL '1 day', 'Resting', NOW()),
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'hydration', '6', NOW() - INTERVAL '1 day', '6 glasses of water', NOW()),
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'sleep_hours', '7.5', NOW() - INTERVAL '1 day', 'Good sleep quality', NOW());

    -- Add cognitive exercises
    INSERT INTO cognitive_exercises (id, title, description, category, difficulty_level, created_at)
    VALUES 
        (uuid_generate_v4(), 'Number Sequence', 'Complete the number pattern: 2,4,6,?', 'memory', 'easy', NOW()),
        (uuid_generate_v4(), 'Word Association', 'Match related words from two columns', 'language', 'medium', NOW()),
        (uuid_generate_v4(), 'Visual Puzzle', 'Find the missing piece in the pattern', 'visual', 'hard', NOW());

    -- Add cognitive progress
    INSERT INTO cognitive_progress (id, user_id, exercise_id, score, completion_time, created_at)
    SELECT 
        uuid_generate_v4(),
        '11111111-1111-1111-1111-111111111111',
        id,
        85,
        INTERVAL '5 minutes',
        NOW()
    FROM cognitive_exercises;

    -- Add emergency contacts
    INSERT INTO emergency_contacts (id, user_id, contact_name, contact_phone, relationship, priority, created_at)
    VALUES 
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Mary Child', '+1234567891', 'daughter', 1, NOW()),
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Dr. Smith', '+1234567892', 'doctor', 2, NOW());

    -- Add voice preferences
    INSERT INTO voice_preferences (id, user_id, language, speed, pitch, created_at)
    VALUES 
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'en-US', 1.0, 1.0, NOW()),
        (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'en-US', 1.0, 1.0, NOW()),
        (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'en-US', 1.0, 1.0, NOW());

    -- Add audit logs
    INSERT INTO audit_logs (id, user_id, action, details, created_at)
    VALUES 
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'login', 'Successful login from iOS device', NOW()),
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'sos_triggered', 'Emergency alert sent to contacts', NOW());

    -- Add notifications
    INSERT INTO notifications (id, user_id, title, body, type, status, created_at)
    VALUES 
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Medicine Reminder', 'Time to take your blood pressure medicine', 'reminder', 'delivered', NOW()),
        (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Health Alert', 'Blood pressure reading is higher than usual', 'alert', 'delivered', NOW());

    -- Add notification failures
    INSERT INTO notification_failures (id, notification_id, error_message, retry_count, created_at)
    VALUES 
        (uuid_generate_v4(), (SELECT id FROM notifications LIMIT 1), 'Device token expired', 1, NOW());

END $$; 