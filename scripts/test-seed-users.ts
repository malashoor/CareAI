import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://your-supabase-url.supabase.co', 'your-anon-key');

const seedTestUsers = async () => {
  const testUsers = [
    { email: 'senior1@careai.app', role: 'senior', name: 'Senior User 1', language: 'en', timezone: 'UTC', notification_preferences: { email: true, sms: false } },
    { email: 'professional1@careai.app', role: 'professional', name: 'Professional User 1', language: 'en', timezone: 'UTC', notification_preferences: { email: true, sms: true } },
    { email: 'child1@careai.app', role: 'child', name: 'Child User 1', language: 'en', timezone: 'UTC', notification_preferences: { email: false, sms: true } },
  ];

  for (const user of testUsers) {
    const { data: existingUser, error: fetchError } = await supabase.auth.admin.listUsers({ email: user.email });

    if (fetchError) {
      console.error(`Error checking existing user for ${user.email}:`, fetchError);
      continue;
    }

    if (existingUser && existingUser.length > 0) {
      console.log(`User already exists: ${user.email}`);
      continue;
    }

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'TestPassword123!',
      email_confirm: true,
    });

    if (authError) {
      console.error(`Error creating auth user for ${user.email}:`, authError);
      continue;
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authUser.user.id,
      name: user.name,
      role: user.role,
      language: user.language,
      timezone: user.timezone,
      notification_preferences: user.notification_preferences,
    });

    if (profileError) {
      console.error(`Error creating profile for ${user.email}:`, profileError);
    } else {
      console.log(`Successfully created test user: ${user.email}`);
    }
  }
};

seedTestUsers().catch((error) => console.error('Error seeding test users:', error));