import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import chalk from 'chalk';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Define environment schema
const envSchema = z.object({
  // Supabase Configuration
  SUPABASE_URL: z.string()
    .url()
    .includes('supabase.co'),
  SUPABASE_SERVICE_ROLE_KEY: z.string()
    .min(1)
    .refine(key => !key.includes('your-service-role-key'), {
      message: 'Service role key appears to be a placeholder'
    }),
  SUPABASE_ANON_KEY: z.string()
    .min(1)
    .refine(key => !key.includes('your-anon-key'), {
      message: 'Anon key appears to be a placeholder'
    }),

  // Environment Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  ENVIRONMENT: z.enum(['development', 'staging', 'production']),
  FEATURE_FLAGS: z.enum(['on', 'off']),
  DEBUG_MODE: z.enum(['true', 'false']),

  // Performance Configuration
  API_TIMEOUT: z.string()
    .transform(Number)
    .refine(n => n > 0 && n <= 60000, {
      message: 'API timeout must be between 1 and 60000ms'
    }),
  MAX_RETRIES: z.string()
    .transform(Number)
    .refine(n => n >= 0 && n <= 10, {
      message: 'Max retries must be between 0 and 10'
    })
});

// Validate environment
try {
  const env = envSchema.parse(process.env);
  
  console.log(chalk.green('✅ Environment validation passed'));
  
  // Additional checks
  if (env.NODE_ENV === 'production') {
    if (env.DEBUG_MODE === 'true') {
      console.log(chalk.yellow('⚠️  Warning: Debug mode is enabled in production'));
    }
    if (env.FEATURE_FLAGS === 'on') {
      console.log(chalk.yellow('⚠️  Warning: Feature flags are enabled in production'));
    }
  }
  
  // Environment consistency check
  if (env.NODE_ENV !== env.ENVIRONMENT) {
    console.log(chalk.yellow(`⚠️  Warning: NODE_ENV (${env.NODE_ENV}) and ENVIRONMENT (${env.ENVIRONMENT}) mismatch`));
  }
  
  process.exit(0);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(chalk.red('❌ Environment validation failed:'));
    error.errors.forEach(err => {
      console.error(chalk.red(`  - ${err.path.join('.')}: ${err.message}`));
    });
  } else {
    console.error(chalk.red('❌ Unexpected error:'), error);
  }
  process.exit(1);
} 