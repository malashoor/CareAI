-- Updated sample data for appointments table (fixed JSON formatting for `location` column)
INSERT INTO appointments (id, senior_id, professional_id, title, location, start_time, end_time, status, created_at)
VALUES
  (gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), 'Initial Consultation', '"Clinic Room A"', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '1 hour', 'scheduled', NOW()),
  (gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), 'Follow-up Visit', '"Telehealth"', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1 hour', 'completed', NOW()),
  (gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), 'Client Unavailable', '"Home Visit"', NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days' + INTERVAL '1 hour', 'cancelled', NOW()),
  (gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), 'Routine Check-up', '"Clinic Room B"', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '1 hour', 'scheduled', NOW());
