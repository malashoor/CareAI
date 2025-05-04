import { Platform } from 'react-native';
import { performanceMonitoring } from '../services/performanceMonitoring';
import { sentryBridge } from '../services/SentryBridge';
import { logPatternMonitoring } from '../services/logPatternMonitoring';
import * as fs from 'fs';
import * as path from 'path';

interface BuildCheckResult {
  success: boolean;
  warnings: string[];
  errors: string[];
  timestamp: string;
  environment: string;
  platform: string;
  version: string;
}

export async function validateLogPatternSetup(): Promise<BuildCheckResult> {
  const result: BuildCheckResult = {
    success: true,
    warnings: [],
    errors: [],
    timestamp: new Date().toISOString(),
    environment: process.env.APP_ENV || 'development',
    platform: Platform.OS,
    version: process.env.APP_VERSION || 'unknown',
  };

  // Check Sentry configuration
  if (!process.env.SENTRY_DSN) {
    result.warnings.push('SENTRY_DSN not configured - crash reporting will be limited');
  }

  // Check environment
  if (!process.env.APP_ENV) {
    result.warnings.push('APP_ENV not set - using default environment');
  }

  // Validate performance monitoring
  try {
    const metrics = performanceMonitoring.getMetrics();
    if (!Array.isArray(metrics)) {
      result.errors.push('Performance monitoring not properly initialized');
      result.success = false;
    }
  } catch (error) {
    result.errors.push('Failed to access performance metrics');
    result.success = false;
  }

  // Check platform-specific requirements
  if (Platform.OS === 'ios') {
    // iOS-specific checks
    if (!process.env.APP_ENV || process.env.APP_ENV === 'production') {
      result.warnings.push('Log pattern monitoring should be disabled in production on iOS');
    }
  } else if (Platform.OS === 'android') {
    // Android-specific checks
    if (!process.env.APP_ENV || process.env.APP_ENV === 'production') {
      result.warnings.push('Log pattern monitoring should be disabled in production on Android');
    }
  }

  // Validate pattern monitoring service
  try {
    const patterns = logPatternMonitoring.getPatterns();
    if (!Array.isArray(patterns) || patterns.length === 0) {
      result.errors.push('No log patterns configured');
      result.success = false;
    }
  } catch (error) {
    result.errors.push('Failed to access log patterns');
    result.success = false;
  }

  // Check Sentry bridge
  try {
    // Attempt to add a test pattern
    sentryBridge.addCriticalPattern({
      category: 'test',
      count: 1,
      severity: 'info',
      examples: ['Test pattern'],
      timestamp: Date.now(),
    });
  } catch (error) {
    result.errors.push('Failed to initialize Sentry bridge');
    result.success = false;
  }

  // Generate CI report if in CI environment
  if (process.env.CI) {
    await generateCIReport(result);
  }

  return result;
}

async function generateCIReport(result: BuildCheckResult) {
  const reportDir = process.env.CI_REPORT_DIR || 'ci-reports';
  const reportPath = path.join(reportDir, `log-pattern-check-${Date.now()}.json`);

  try {
    // Ensure directory exists
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Write report
    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
    console.log(`CI report generated at: ${reportPath}`);
  } catch (error) {
    console.error('Failed to generate CI report:', error);
  }
}

export function logBuildCheckResults(result: BuildCheckResult) {
  console.group('Log Pattern Monitoring Build Check');
  
  if (result.success) {
    console.log('✅ Build check passed');
  } else {
    console.error('❌ Build check failed');
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ Warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (result.errors.length > 0) {
    console.error('❌ Errors:');
    result.errors.forEach(error => console.error(`  - ${error}`));
  }

  // Log environment info
  console.log('\nEnvironment:');
  console.log(`  Platform: ${result.platform}`);
  console.log(`  Environment: ${result.environment}`);
  console.log(`  Version: ${result.version}`);
  console.log(`  Timestamp: ${result.timestamp}`);

  console.groupEnd();
} 