import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = `.env.${NODE_ENV}`;
const envPath = path.resolve(process.cwd(), envFile);

console.log('Loading environment from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(`Error loading ${envFile}:`, result.error);
  process.exit(1);
}

// Debug environment variables
console.log('Environment variables:');
console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wpzpmgvqcanvtjusxbeg.supabase.co');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '***' : 'undefined');
console.log('NODE_ENV:', NODE_ENV);

// Use hardcoded URL if environment variable is not set
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wpzpmgvqcanvtjusxbeg.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  if (!supabaseUrl) console.error('   Missing EXPO_PUBLIC_SUPABASE_URL');
  if (!supabaseKey) console.error('   Missing SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface RLSConfig {
  table_name: string;
  has_rls: boolean;
  has_policies: boolean;
}

const CREATE_VIEW_SQL = `
-- Create or replace the RLS check view directly
CREATE OR REPLACE VIEW public.rls_check AS
WITH tables AS (
  SELECT t.tablename::text as table_name
  FROM pg_tables t
  WHERE t.schemaname = 'public'
),
rls_status AS (
  SELECT t.tablename::text as table_name,
         t.rowsecurity as has_rls
  FROM pg_tables t
  WHERE t.schemaname = 'public'
),
policy_status AS (
  SELECT DISTINCT p.tablename::text as table_name,
         true as has_policies
  FROM pg_policies p
  WHERE p.schemaname = 'public'
)
SELECT t.table_name,
       COALESCE(r.has_rls, false) as has_rls,
       COALESCE(p.has_policies, false) as has_policies
FROM tables t
LEFT JOIN rls_status r ON t.table_name = r.table_name
LEFT JOIN policy_status p ON t.table_name = p.table_name;

-- Grant select permission to authenticated users
GRANT SELECT ON public.rls_check TO authenticated;
`;

async function verifyRLS() {
  try {
    console.log('🔒 Verifying RLS policies...\n');

    // Get RLS configuration for all tables
    const { data, error } = await supabase.from('rls_check').select('*');

    if (error?.message?.includes('relation "public.rls_check" does not exist')) {
      console.error('❌ RLS check view is missing');
      console.error('\n⚠️  Please run the following SQL in your Supabase dashboard:');
      console.error(CREATE_VIEW_SQL);
      process.exit(1);
    } else if (error) {
      console.error('❌ Error checking RLS configuration:', error);
      process.exit(1);
    }

    const tables = data || [];
    const tablesWithoutRLS = tables.filter((t: RLSConfig) => !t.has_rls);
    const tablesWithoutPolicies = tables.filter((t: RLSConfig) => t.has_rls && !t.has_policies);

    if (tablesWithoutRLS.length > 0) {
      console.error('❌ Tables without RLS enabled:');
      tablesWithoutRLS.forEach((table: RLSConfig) => {
        console.error(`   - ${table.table_name}`);
      });
      process.exit(1);
    }

    if (tablesWithoutPolicies.length > 0) {
      console.error('\n❌ Tables without any policies:');
      tablesWithoutPolicies.forEach((table: RLSConfig) => {
        console.error(`   - ${table.table_name}`);
      });
      process.exit(1);
    }

    console.log('✅ All tables have RLS enabled and policies configured');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error verifying RLS:', error);
    process.exit(1);
  }
}

verifyRLS(); 