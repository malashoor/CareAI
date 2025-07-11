// For testing notifications from Supabase Edge Functions or server-side functions
// This script can be used to test the notification pipeline

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function sendTestNotification() {
  try {
    // Get user ID from command line args or use a default
    const userId = process.argv[2] || null;
    
    if (!userId) {
      console.error('Please provide a user ID as the first argument.');
      process.exit(1);
    }

    // Generate a unique event ID
    const eventId = crypto.randomUUID();

    // Create notification entries for testing
    console.log(`Creating test notification for user ${userId}...`);
    
    // Test SOS emergency notification
    const { error } = await supabase
      .from('notifications')
      .insert({
        event_id: eventId,
        event: {
          type: 'sos_triggered',
          title: 'SOS Alert',
          message: 'Emergency assistance needed',
          source: 'sos',
          severity: 'critical',
          user_id: userId,
          location: {
            latitude: 37.7749,
            longitude: -122.4194
          }
        },
        recipient_id: userId,
        channel: 'push',
        status: 'pending',
        created_at: new Date().toISOString(),
        scheduled_for: new Date().toISOString(),
        retry_count: 0
      });

    if (error) {
      throw error;
    }

    console.log('Test notification created successfully!');
    console.log('The app should display this notification if the user has push notifications enabled.');
    console.log('Event ID:', eventId);
  } catch (error) {
    console.error('Error creating test notification:', error);
  }
}

sendTestNotification(); 