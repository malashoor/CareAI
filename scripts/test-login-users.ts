import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://your-supabase-url.supabase.co', 'your-anon-key');

const testLoginUsers = async () => {
  const testUsers = [
    { email: 'senior1@careai.app', password: 'TestPassword123!' },
    { email: 'professional1@careai.app', password: 'TestPassword123!' },
    { email: 'child1@careai.app', password: 'TestPassword123!' },
  ];

  for (const user of testUsers) {
    const { data: session, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

    if (error) {
      console.error(`Error logging in user ${user.email}:`, error);
    } else {
      console.log(`Successfully logged in user: ${user.email}`);
      console.log('Session:', session);
    }
  }
};

testLoginUsers().catch((error) => console.error('Error logging in test users:', error));