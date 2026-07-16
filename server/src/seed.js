const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function runSeed() {
  console.log('Running database seed...');
  const seedFile = path.join(__dirname, '../seeds/seed.sql');
  
  try {
    if (!fs.existsSync(seedFile)) {
      throw new Error(`Seed file not found at ${seedFile}`);
    }
    
    const sql = fs.readFileSync(seedFile, 'utf8');
    await pool.query(sql);
    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
