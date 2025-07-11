import { envLoader } from './env-loader.js';
import chalk from 'chalk';

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export class EnvironmentValidator {
  private static CRITICAL_TABLES = [
    'medical_records',
    'prescriptions',
    'health_metrics',
    'emergency_contacts'
  ];

  private static SECURE_PATTERNS = {
    SUPABASE_URL: /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/,
    SUPABASE_SERVICE_ROLE_KEY: /^[a-zA-Z0-9_.-]{40,}$/,
    SUPABASE_ANON_KEY: /^[a-zA-Z0-9_.-]{40,}$/
  };

  private static INSECURE_DEFAULTS = [
    'your-project-id',
    'your-secret-key',
    'your-anon-key',
    'example',
    'test',
    'default',
    'your-service-role-key',
    'your-project'
  ];

  private static DEVELOPMENT_INDICATORS = [
    'dev',
    'development',
    'test',
    'staging',
    'local'
  ];

  public static async validateEnvironment(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      warnings: [],
      errors: []
    };

    try {
      // Load and validate environment
      const env = envLoader.loadEnvironment({ required: true });

      // Check for production environment
      const isProduction = env.ENVIRONMENT === 'production';
      const isStaging = env.ENVIRONMENT === 'staging';

      // Basic validation
      this.validateCredentials(env, result, isProduction);
      this.validateEnvironmentConsistency(env, result);
      this.validateSecuritySettings(env, result, isProduction);
      this.validatePerformanceSettings(env, result, isProduction);

      // Environment-specific validation
      if (isProduction) {
        this.validateProductionEnvironment(env, result);
      } else if (isStaging) {
        this.validateStagingEnvironment(env, result);
      } else {
        this.validateDevelopmentEnvironment(env, result);
      }

      // Update validity based on errors
      result.isValid = result.errors.length === 0;

      // Log results
      this.logValidationResults(result);

    } catch (error) {
      result.isValid = false;
      result.errors.push(`❌ Environment validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  private static validateCredentials(env: any, result: ValidationResult, isProduction: boolean): void {
    // Check for empty values
    if (!env.SUPABASE_URL) {
      result.errors.push('❌ Empty Supabase URL');
    }
    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
      result.errors.push('❌ Empty service role key');
    }
    if (!env.SUPABASE_ANON_KEY) {
      result.errors.push('❌ Empty anon key');
    }

    // Validate URL format
    if (env.SUPABASE_URL && !this.SECURE_PATTERNS.SUPABASE_URL.test(env.SUPABASE_URL)) {
      result.errors.push('❌ Invalid Supabase URL format');
    }

    // Validate key formats only in production
    if (isProduction) {
      if (env.SUPABASE_SERVICE_ROLE_KEY && !this.SECURE_PATTERNS.SUPABASE_SERVICE_ROLE_KEY.test(env.SUPABASE_SERVICE_ROLE_KEY)) {
        result.errors.push('❌ Invalid service role key format');
      }
      if (env.SUPABASE_ANON_KEY && !this.SECURE_PATTERNS.SUPABASE_ANON_KEY.test(env.SUPABASE_ANON_KEY)) {
        result.errors.push('❌ Invalid anon key format');
      }
    }

    // Check for insecure defaults
    Object.entries(env).forEach(([key, value]) => {
      if (typeof value === 'string' && 
          this.INSECURE_DEFAULTS.some(def => value.toLowerCase().includes(def))) {
        result.errors.push(`❌ Insecure default value detected in ${key}`);
      }
    });
  }

  private static validateEnvironmentConsistency(env: any, result: ValidationResult): void {
    // Check NODE_ENV and ENVIRONMENT consistency
    if (env.NODE_ENV !== env.ENVIRONMENT) {
      result.warnings.push('⚠️ Inconsistent NODE_ENV and ENVIRONMENT values');
    }

    // Check for production NODE_ENV with non-production ENVIRONMENT
    if (env.NODE_ENV === 'production' && env.ENVIRONMENT !== 'production') {
      result.warnings.push(`⚠️ Production NODE_ENV with ${env.ENVIRONMENT} ENVIRONMENT`);
    }

    // Check for development indicators in production URLs
    if (env.ENVIRONMENT === 'production' && 
        this.DEVELOPMENT_INDICATORS.some(indicator => 
          env.SUPABASE_URL.toLowerCase().includes(indicator))) {
      result.errors.push('❌ Development Supabase URL detected in production');
    }
  }

  private static validateSecuritySettings(env: any, result: ValidationResult, isProduction: boolean): void {
    // Debug mode checks
    if (isProduction && env.DEBUG_MODE === 'true') {
      result.errors.push('❌ Debug mode enabled in production');
    }

    // Feature flags in production
    if (isProduction && env.FEATURE_FLAGS === 'on') {
      result.warnings.push('⚠️ Feature flags enabled in production');
    }
  }

  private static validatePerformanceSettings(env: any, result: ValidationResult, isProduction: boolean): void {
    const timeout = parseInt(env.API_TIMEOUT.toString());
    const retries = parseInt(env.MAX_RETRIES.toString());

    // Production checks
    if (isProduction) {
      if (timeout < 30000) {
        result.warnings.push('⚠️ API timeout may be too low for production');
      }
      if (retries < 3) {
        result.warnings.push('⚠️ Max retries may be too low for production');
      }
    }
    // Development checks
    else {
      if (timeout > 60000) {
        result.warnings.push('⚠️ API timeout is quite high for development');
      }
    }

    // Check for potential timeout/retry issues
    if (timeout < 10000 && retries > 5) {
      result.warnings.push('⚠️ High retry count with low timeout may cause issues');
    }
  }

  private static validateProductionEnvironment(env: any, result: ValidationResult): void {
    // Additional production-specific checks
    if (env.NODE_ENV !== 'production') {
      result.errors.push('❌ Production environment requires NODE_ENV=production');
    }
  }

  private static validateStagingEnvironment(env: any, result: ValidationResult): void {
    // Staging-specific checks
    if (env.DEBUG_MODE === 'true') {
      result.warnings.push('⚠️ Debug mode enabled in staging environment');
    }
  }

  private static validateDevelopmentEnvironment(env: any, result: ValidationResult): void {
    // Development-specific checks can be added here
  }

  private static logValidationResults(result: ValidationResult): void {
    if (!result.isValid) {
      console.error(chalk.red('\n🚨 Environment Validation Errors:'));
      result.errors.forEach(error => console.error(chalk.red(error)));
    }

    if (result.warnings.length > 0) {
      console.warn(chalk.yellow('\n⚠️ Environment Validation Warnings:'));
      result.warnings.forEach(warning => console.warn(chalk.yellow(warning)));
    }

    if (result.isValid && result.warnings.length === 0) {
      console.log(chalk.green('\n✅ Environment validation passed'));
    }
  }

  public static getProductionChecklist(): string[] {
    return [
      '✓ DEBUG_MODE is set to false',
      '✓ FEATURE_FLAGS are properly configured',
      '✓ API_TIMEOUT is set appropriately (≥ 30000ms)',
      '✓ MAX_RETRIES is set appropriately (≥ 3)',
      '✓ All Supabase credentials are production values',
      '✓ No development or test values remain',
      '✓ Environment is set to "production"'
    ];
  }
} 