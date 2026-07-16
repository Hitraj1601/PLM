// Temporary script to drop all tables and migration tracker so we can re-migrate cleanly
const pool = require('./config/db');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function reset() {
  const client = await pool.connect();
  try {
    console.log('Dropping all tables...');
    await client.query(`
      DROP TABLE IF EXISTS migrations_tracker CASCADE;
      DROP TABLE IF EXISTS eco_predictions CASCADE;
      DROP TABLE IF EXISTS chat_messages CASCADE;
      DROP TABLE IF EXISTS audit_logs CASCADE;
      DROP TABLE IF EXISTS eco_changes CASCADE;
      DROP TABLE IF EXISTS ecos CASCADE;
      DROP TABLE IF EXISTS eco_stages CASCADE;
      DROP TABLE IF EXISTS bom_operations CASCADE;
      DROP TABLE IF EXISTS bom_components CASCADE;
      DROP TABLE IF EXISTS bom CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('All tables dropped successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

reset().catch(console.error);
