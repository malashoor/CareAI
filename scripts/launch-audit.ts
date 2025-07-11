import chalk from 'chalk';
import { EnvironmentValidator } from './utils/env-validator.js';
import { RLSVerifier } from './verify-rls-policies.js';

async function runSecurityAudit() {
  console.log(chalk.blue('\n🔒 Starting CareAI Security Audit\n'));

  try {
    // Step 1: Validate Environment
    console.log(chalk.cyan('Step 1: Environment Validation'));
    const envResult = await EnvironmentValidator.validateEnvironment();
    
    if (!envResult.isValid) {
      console.error(chalk.red('\n❌ Environment validation failed. Please fix errors before proceeding.'));
      process.exit(1);
    }

    // Step 2: Verify RLS Policies
    console.log(chalk.cyan('\nStep 2: RLS Policy Verification'));
    const verifier = new RLSVerifier();
    const rlsResult = await verifier.verifyAllPolicies({
      verbose: true,
      checkForeignKeys: true
    });

    if (!rlsResult) {
      console.error(chalk.red('\n❌ RLS policy verification failed.'));
      process.exit(1);
    }

    // Step 3: Production Checklist (if in production)
    if (process.env.ENVIRONMENT === 'production') {
      console.log(chalk.cyan('\nStep 3: Production Checklist'));
      console.log('Please verify the following:');
      EnvironmentValidator.getProductionChecklist().forEach(item => {
        console.log(chalk.yellow(item));
      });
    }

    // Final Summary
    console.log(chalk.green('\n✅ Security Audit Completed Successfully'));
    console.log(chalk.gray('\nRecommendations:'));
    console.log(chalk.gray('1. Review any warnings in the audit log'));
    console.log(chalk.gray('2. Check audit logging is enabled on critical tables'));
    console.log(chalk.gray('3. Verify emergency access policies are properly configured'));
    console.log(chalk.gray('4. Ensure all environment variables are properly set'));

  } catch (error) {
    console.error(chalk.red('\n❌ Security audit failed:'), error);
    process.exit(1);
  }
}

// Run the audit if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  runSecurityAudit().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}