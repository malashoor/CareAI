import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import glob from 'glob';

interface SecurityCheck {
  name: string;
  check: () => Promise<boolean>;
  error: string;
  fix: string;
}

export class SecurityAuditor {
  private supabase;
  private isProd: boolean;

  constructor(url: string, key: string, isProd: boolean) {
    this.supabase = createClient(url, key);
    this.isProd = isProd;
  }

  private async checkJWTSecret(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('check_jwt_secret_modified');
      
      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('Failed to check JWT secret:', error);
      return false;
    }
  }

  private async checkPublicBuckets(): Promise<boolean> {
    try {
      const { data: buckets, error } = await this.supabase
        .rpc('list_public_buckets');
      
      if (error) throw error;
      
      // In production, warn about any public buckets
      if (this.isProd && buckets && buckets.length > 0) {
        console.warn('⚠️ Public buckets found:', buckets);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to check public buckets:', error);
      return false;
    }
  }

  private async checkEdgeFunctionSecurity(): Promise<boolean> {
    try {
      const { data: functions, error } = await this.supabase
        .rpc('list_edge_functions');
      
      if (error) throw error;

      for (const func of functions) {
        // Check CORS headers
        const { data: headers } = await this.supabase
          .rpc('get_function_headers', { function_name: func.name });
        
        if (!headers['Access-Control-Allow-Origin']) {
          console.warn(`⚠️ Missing CORS headers for function: ${func.name}`);
          return false;
        }

        // Check OPTIONS route
        const { data: hasOptions } = await this.supabase
          .rpc('check_function_options_route', { function_name: func.name });
        
        if (!hasOptions) {
          console.warn(`⚠️ Missing OPTIONS route for function: ${func.name}`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to check edge functions:', error);
      return false;
    }
  }

  private async checkForTestUsers(): Promise<boolean> {
    try {
      const { data: testUsers, error } = await this.supabase
        .from('users')
        .select('email')
        .ilike('email', '%test%')
        .or('email.ilike.%example%');
      
      if (error) throw error;

      if (this.isProd && testUsers && testUsers.length > 0) {
        console.warn('⚠️ Test users found:', testUsers.map(u => u.email));
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to check for test users:', error);
      return false;
    }
  }

  private async checkForDevLogs(): Promise<boolean> {
    try {
      const files = await new Promise<string[]>((resolve, reject) => {
        glob('**/*.{ts,tsx,js,jsx}', {
          ignore: ['node_modules/**', 'build/**', 'dist/**']
        }, (err, files) => {
          if (err) reject(err);
          else resolve(files);
        });
      });

      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        
        // Check for console.log statements
        if (this.isProd && content.includes('console.log(')) {
          console.warn(`⚠️ console.log found in: ${file}`);
          return false;
        }

        // Check for development flags
        const devFlags = [
          'isDevelopment',
          'DEBUG',
          'TESTING',
          'process.env.NODE_ENV === "development"'
        ];

        for (const flag of devFlags) {
          if (content.includes(flag)) {
            console.warn(`⚠️ Development flag "${flag}" found in: ${file}`);
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to check for dev logs:', error);
      return false;
    }
  }

  private async checkSentryConfig(): Promise<boolean> {
    try {
      const appConfig = await fs.readFile(
        path.join(process.cwd(), 'app.config.ts'),
        'utf-8'
      );

      if (this.isProd) {
        // Check for Sentry initialization
        if (!appConfig.includes('Sentry.init(')) {
          console.warn('⚠️ Sentry.init() not found in app.config.ts');
          return false;
        }

        // Check for proper environment
        if (!appConfig.includes('environment: "production"')) {
          console.warn('⚠️ Sentry production environment not configured');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to check Sentry config:', error);
      return false;
    }
  }

  public async runAllChecks(): Promise<boolean> {
    const checks: SecurityCheck[] = [
      {
        name: 'JWT Secret',
        check: () => this.checkJWTSecret(),
        error: 'JWT secret is using default value or is missing',
        fix: 'Generate a new JWT secret in Supabase dashboard'
      },
      {
        name: 'Public Storage',
        check: () => this.checkPublicBuckets(),
        error: 'Public storage buckets found in production',
        fix: 'Review and secure public buckets or move to signed URLs'
      },
      {
        name: 'Edge Functions',
        check: () => this.checkEdgeFunctionSecurity(),
        error: 'Edge functions missing security headers',
        fix: 'Add CORS and OPTIONS handling to all edge functions'
      },
      {
        name: 'Test Users',
        check: () => this.checkForTestUsers(),
        error: 'Test user accounts found in production',
        fix: 'Remove or disable test accounts before deployment'
      },
      {
        name: 'Development Artifacts',
        check: () => this.checkForDevLogs(),
        error: 'Development logs or flags found in production code',
        fix: 'Remove console.logs and development flags'
      },
      {
        name: 'Error Tracking',
        check: () => this.checkSentryConfig(),
        error: 'Sentry not properly configured for production',
        fix: 'Enable Sentry with proper production configuration'
      }
    ];

    let allPassed = true;
    console.log('\n🔒 Running Enhanced Security Checks...\n');

    for (const check of checks) {
      process.stdout.write(`Testing: ${check.name}... `);
      const passed = await check.check();
      
      if (passed) {
        console.log('✅ PASSED');
      } else {
        console.log('❌ FAILED');
        console.log(`  Error: ${check.error}`);
        console.log(`  Fix: ${check.fix}\n`);
        allPassed = false;
      }
    }

    return allPassed;
  }
} 