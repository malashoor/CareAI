import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const template = `# === Supabase Configuration ===
# Replace these with your actual Supabase project values
# Format: https://<project-id>.supabase.co
SUPABASE_URL=https://your-project-id.supabase.co
# Find these in your Supabase project dashboard -> Settings -> API
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# === App Environment ===
# Controls Node environment and related behaviors
NODE_ENV=development
# Determines app-specific environment settings
# Valid options: development | staging | production
ENVIRONMENT=development
# Feature flag master switch
# Valid options: on | off
FEATURE_FLAGS=off
# Enables detailed logging and development tools
# Valid options: true | false
DEBUG_MODE=true

# === Performance Config ===
# API request timeout in milliseconds
# Recommended: 30000 for development, 60000 for production
API_TIMEOUT=30000
# Maximum number of API retry attempts
# Recommended: 3 for development, 5 for production
MAX_RETRIES=3`;

function generateEnvTemplate() {
  try {
    const templatePath = path.resolve(process.cwd(), '.env.template');
    fs.writeFileSync(templatePath, template, 'utf8');
    console.log(chalk.green('✅ Successfully created .env.template'));
    
    // Create .env.local if it doesn't exist
    const localEnvPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(localEnvPath)) {
      fs.copyFileSync(templatePath, localEnvPath);
      console.log(chalk.green('✅ Created .env.local from template'));
      console.log(chalk.yellow('⚠️  Please edit .env.local with your actual values'));
    }
  } catch (error) {
    console.error(chalk.red('❌ Error generating environment templates:'), error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  generateEnvTemplate();
} 