import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';



const supabaseUrl = 'https://wpzpmgvqcanvtjusxbeg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwenBtZ3ZxY2FudnRqdXN4YmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NDgyNjksImV4cCI6MjA1ODEyNDI2OX0.oMrRv28hCYUydx-t4Hn-zk9Tv5k71xG81XP8jhZfguo'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 