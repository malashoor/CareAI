-- Seed data for profiles table to support appointments foreign key constraints
INSERT INTO profiles (id, role, full_name, created_at, updated_at)
VALUES
  ('bd629a39-ae3b-415a-94ab-407f458a4aca', 'senior', 'Test Senior 1', NOW(), NOW()),
  ('c7f3e8d2-4b5a-4e6b-8f3d-2a4b5a4e6b8f', 'senior', 'Test Senior 2', NOW(), NOW()),
  ('d8f4e9c3-5c6b-4f7c-9f4d-3c5c6b4f7c9f', 'professional', 'Test Professional 1', NOW(), NOW()),
  ('e9f5f0d4-6d7c-5g8d-0f5e-4d6d7c5g8d0f', 'professional', 'Test Professional 2', NOW(), NOW());
