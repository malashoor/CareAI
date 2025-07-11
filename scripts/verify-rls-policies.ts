import { Command } from 'commander';
import { createClient } from '@supabase/supabase-js';
import { envLoader } from './utils/env-loader.js';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

interface TableInfo {
  table_name: string;
  has_rls: boolean;
  has_policies: boolean;
}

export class RLSVerifier {
  private supabase;

  constructor() {
    const env = envLoader.loadEnvironment({ required: true });
    this.supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  public async verifyAllPolicies(options: { 
    table?: string,
    verbose?: boolean,
    checkForeignKeys?: boolean
  } = {}): Promise<boolean> {
    try {
      const { data: tables, error } = await this.supabase.from('rls_check').select('*');

      if (error) {
        console.error(chalk.red('Error during verification:'), error);
        return false;
      }

      let allValid = true;

      // Filter tables if specific table is requested
      const tablesToCheck = options.table 
        ? tables.filter((t: TableInfo) => t.table_name === options.table)
        : tables;

      if (options.table && tablesToCheck.length === 0) {
        console.error(chalk.red(`❌ Table "${options.table}" not found`));
        return false;
      }

      for (const table of tablesToCheck) {
        if (!table.has_rls) {
          console.error(chalk.red(`❌ RLS not enabled on table: ${table.table_name}`));
          allValid = false;
          continue;
        }

        if (!table.has_policies) {
          console.error(chalk.red(`❌ No policies defined for table: ${table.table_name}`));
          allValid = false;
        }
      }

      if (allValid) {
        console.log(chalk.green(`\n✅ All RLS policies verified successfully!`));
      }

      return allValid;
    } catch (error) {
      console.error(chalk.red('Error during verification:'), error);
      return false;
    }
  }
}

// CLI setup
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const program = new Command();

  program
    .name('verify-rls-policies')
    .description('Verify RLS policies in Supabase database')
    .option('-t, --table <n>', 'Verify specific table')
    .option('-v, --verbose', 'Show detailed policy information')
    .option('-f, --check-foreign-keys', 'Check foreign key policies')
    .parse(process.argv);

  const options = program.opts();

  const verifier = new RLSVerifier();
  verifier.verifyAllPolicies({
    table: options.table,
    verbose: options.verbose,
    checkForeignKeys: options.checkForeignKeys
  }).then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
} 