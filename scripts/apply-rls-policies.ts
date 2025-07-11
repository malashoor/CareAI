import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
const envPath = process.env.NODE_ENV === 'production' 
  ? '.env.production'
  : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envPath) });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface TableConfig {
  name: string;
  userIdColumn: string;
  policies: ('standard' | 'admin' | 'emergency')[];
  isPublic?: boolean;
}

async function applyPolicies(tables: TableConfig[]) {
  try {
    console.log('🔒 Applying RLS policies...\n');

    for (const table of tables) {
      console.log(`Processing table: ${table.name}`);

      // Read policy templates
      const policyDir = path.join(process.cwd(), 'supabase', 'policies');
      let sql = '';

      for (const policy of table.policies) {
        const templatePath = path.join(policyDir, `${policy}-access-policy.sql`);
        let template = await fs.readFile(templatePath, 'utf-8');

        // Replace placeholders
        template = template
          .replace(/table_name/g, table.name)
          .replace(/user_id_column/g, table.userIdColumn);

        sql += template + '\n';
      }

      // Apply policies
      const { error } = await supabase.rpc('apply_sql', { sql });
      
      if (error) {
        console.error(`❌ Error applying policies to ${table.name}:`, error);
        continue;
      }

      console.log(`✅ Applied policies to ${table.name}`);
    }

    console.log('\n✅ All policies applied successfully!');
  } catch (error) {
    console.error('❌ Error applying policies:', error);
    process.exit(1);
  }
}

// Example usage:
const tables: TableConfig[] = [
  {
    name: 'profiles',
    userIdColumn: 'id',
    policies: ['standard', 'admin'],
    isPublic: false
  },
  {
    name: 'medical_records',
    userIdColumn: 'patient_id',
    policies: ['standard', 'admin', 'emergency'],
    isPublic: false
  }
  // Add more tables as needed
];

applyPolicies(tables); 