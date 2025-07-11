// This is a local test script for notification pipeline
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Local Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simplified notification event validation
const validateEvent = (event) => {
  const requiredFields = ['id', 'timestamp', 'source', 'severity', 'recipientRoles', 'payload'];
  const missingFields = requiredFields.filter(field => !event[field]);
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  // Check payload has title and body
  if (!event.payload.title || !event.payload.body) {
    return {
      valid: false,
      error: 'Payload must contain title and body'
    };
  }
  
  return { valid: true };
};

// Process notification event (simulating Edge Function logic)
async function processNotification(event) {
  console.log('Processing event:', event.id);
  
  // Validate event
  const validation = validateEvent(event);
  if (!validation.valid) {
    console.error('Event validation failed:', validation.error);
    return { error: validation.error };
  }
  
  try {
    // 1. Find matching routing rules
    const { data: rules, error: rulesError } = await supabase
      .from('routing_rules')
      .select('*')
      .eq('event_type', event.source)
      .lte('min_severity', event.severity)
      .eq('active', true)
      .order('priority');
    
    if (rulesError) {
      console.error('Error fetching rules:', rulesError);
      return { error: 'Error fetching routing rules' };
    }
    
    if (!rules?.length) {
      console.warn('No matching rules found for event:', event.id);
      return { 
        message: 'No matching routing rules found',
        event_id: event.id
      };
    }
    
    console.log(`Found ${rules.length} matching rules`);
    
    // 2. Get recipients by roles (if profiles table exists)
    try {
      const recipientRoles = new Set(
        rules.flatMap(rule => rule.recipient_roles)
          .filter(role => event.recipientRoles.includes(role))
      );
      
      console.log('Recipient roles:', Array.from(recipientRoles));
      
      const { data: recipients, error: recipientsError } = await supabase
        .from('profiles')
        .select('id, role')
        .in('role', Array.from(recipientRoles));
      
      if (recipientsError) {
        console.error('Error fetching recipients:', recipientsError);
        // Continue with demo users for testing
      } else {
        console.log(`Found ${recipients?.length || 0} matching recipients`);
      }
      
      // 3. For testing: simulate notifications creation
      const notificationsSimulated = [];
      
      // Use mock recipients if none found
      const testRecipients = recipients?.length ? recipients : [
        { id: 'test-user-1', role: 'family' },
        { id: 'test-user-2', role: 'healthpro' }
      ];
      
      for (const rule of rules) {
        const matchingRecipients = testRecipients.filter(r => 
          rule.recipient_roles.includes(r.role)
        );
        
        for (const recipient of matchingRecipients) {
          for (const channel of rule.channels) {
            notificationsSimulated.push({
              event_id: event.id,
              recipient_id: recipient.id,
              channel,
              status: 'pending',
              scheduled_for: new Date().toISOString()
            });
          }
        }
      }
      
      console.log('Notifications that would be created:');
      console.log(JSON.stringify(notificationsSimulated, null, 2));
      
      return {
        success: true,
        event_id: event.id,
        notifications_simulated: notificationsSimulated.length,
        notifications: notificationsSimulated
      };
      
    } catch (error) {
      console.error('Error in recipient processing:', error);
      return { error: 'Error processing recipients' };
    }
    
  } catch (error) {
    console.error('Error processing notification:', error);
    return { error: 'Error processing notification' };
  }
}

// Test event
const testEvent = {
  id: 'test-event-123',
  timestamp: new Date().toISOString(),
  source: 'sos',
  severity: 'critical',
  recipientRoles: ['family', 'healthpro'],
  payload: {
    title: 'Emergency SOS',
    body: 'User has triggered an emergency alert',
    data: {
      userId: 'test-user-id',
      location: 'Home'
    }
  }
};

// Run the test
async function runTest() {
  console.log('Running notification pipeline test with event:', testEvent.id);
  const result = await processNotification(testEvent);
  console.log('Test result:', JSON.stringify(result, null, 2));
}

runTest().catch(console.error); 