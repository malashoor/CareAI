import 'dotenv/config';
import { Client } from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

const appointmentsSeedPath = path.join(__dirname, 'appointments_seed.sql');

async function runAppointmentsSeed() {
  const sql = fs.readFileSync(appointmentsSeedPath, 'utf8');
  console.log(`🔄 Running: appointments_seed.sql`);
  await client.query(sql);
  console.log(`✅ Done: appointments_seed.sql`);
}

async function runSeedFiles() {
  const seedsDir = path.join(__dirname, '../supabase/seeds');
  const files = fs.readdirSync(seedsDir).filter(f => f.endsWith('.sql'));

  for (const file of files) {
    const filePath = path.join(seedsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`🔄 Running: ${file}`);
    await client.query(sql);
    console.log(`✅ Done: ${file}`);
  }
}

async function main() {
  try {
    await client.connect();
    console.log('🌱 Connected to DB');
    await runAppointmentsSeed();
    await runSeedFiles();
    console.log('✅ All seed files completed.');
  } catch (err) {
    console.error('❌ Error running seeds:', err);
  } finally {
    await client.end();
  }
}

main();
