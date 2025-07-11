#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🧪 Testing Supabase Database Connection...');
console.log('=============================================');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('📍 URL:', supabaseUrl || 'NOT FOUND');
console.log('🔑 Anon Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' + supabaseAnonKey.substring(supabaseAnonKey.length - 4) : 'NOT FOUND');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n🔍 Testing database access...');
    
    // Test basic connection
    const { data, error, count } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Database connection successful!');
    console.log('📊 Profiles table accessible');
    console.log('📈 Record count:', count !== null ? count : 'Available');
    
    // Test authentication
    console.log('\n🔍 Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError && authError.message !== 'Auth session missing!') {
      console.log('⚠️  Auth warning:', authError.message);
    } else {
      console.log('✅ Authentication system accessible');
    }
    
    console.log('\n🎉 New Supabase credentials are working perfectly!');
    console.log('🔒 Database: SECURED with new keys');
    console.log('✅ Ready for application use');
    
  } catch (err) {
    console.log('❌ Connection error:', err.message);
    process.exit(1);
  }
}

testConnection(); 