import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Environment schema with validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Service role key is required'),
  SUPABASE_ANON_KEY: z.string().min(1, 'Anon key is required'),
  ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
  FEATURE_FLAGS: z.enum(['on', 'off']).default('off'),
  DEBUG_MODE: z.enum(['true', 'false']).default('false'),
  API_TIMEOUT: z.string().regex(/^\d+$/).transform(Number).default('30000'),
  MAX_RETRIES: z.string().regex(/^\d+$/).transform(Number).default('3')
});

type EnvConfig = z.infer<typeof envSchema>;

class EnvironmentLoader {
  private static instance: EnvironmentLoader;
  private config: EnvConfig | null = null;

  private constructor() {}

  public static getInstance(): EnvironmentLoader {
    if (!EnvironmentLoader.instance) {
      EnvironmentLoader.instance = new EnvironmentLoader();
    }
    return EnvironmentLoader.instance;
  }

  public loadEnvironment(options: { required?: boolean } = {}): EnvConfig {
    if (this.config) return this.config;

    try {
      // Determine environment file
      const envFile = process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development';

      // Load environment variables
      const result = dotenv.config({
        path: path.resolve(process.cwd(), envFile)
      });

      if (result.error) {
        if (options.required) {
          throw new Error(`Failed to load ${envFile}: ${result.error.message}`);
        }
        console.warn(`⚠️ Warning: ${envFile} not found, using existing environment variables`);
      }

      // Validate environment
      const validatedEnv = envSchema.parse({
        ...process.env,
        // Map Expo variables to Supabase variables if needed
        SUPABASE_URL: process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
      });

      // Cache the validated config
      this.config = validatedEnv;

      return validatedEnv;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => 
          `- ${issue.path.join('.')}: ${issue.message}`
        ).join('\n');
        
        throw new Error(
          `❌ Environment validation failed:\n${issues}\n\n` +
          `Please check your environment configuration.`
        );
      }
      throw error;
    }
  }

  public getConfig(): EnvConfig {
    if (!this.config) {
      throw new Error('Environment not loaded. Call loadEnvironment() first.');
    }
    return this.config;
  }

  public isDevelopment(): boolean {
    return this.getConfig().ENVIRONMENT === 'development';
  }

  public isProduction(): boolean {
    return this.getConfig().ENVIRONMENT === 'production';
  }

  public isStaging(): boolean {
    return this.getConfig().ENVIRONMENT === 'staging';
  }

  public isDebugEnabled(): boolean {
    return this.getConfig().DEBUG_MODE === 'true';
  }

  public areFeaturesEnabled(): boolean {
    return this.getConfig().FEATURE_FLAGS === 'on';
  }
}

// Export singleton instance
export const envLoader = EnvironmentLoader.getInstance();

// Export type for use in other files
export type { EnvConfig }; 