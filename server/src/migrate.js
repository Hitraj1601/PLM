const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function runMigrations() {
  console.log('Running migrations...');
  const migrationsDir = path.join(__dirname, '../migrations');
  
  try {
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Create migration tracking table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations_tracker (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Fetch already executed migrations
    const { rows } = await pool.query('SELECT name FROM migrations_tracker');
    const executedMigrations = new Set(rows.map(r => r.name));

    for (const file of files) {
      if (executedMigrations.has(file)) {
        console.log(`Migration ${file} already executed, skipping.`);
        continue;
      }

      console.log(`Executing migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute migration
      await pool.query(sql);
      
      // Record execution
      await pool.query('INSERT INTO migrations_tracker (name) VALUES ($1)', [file]);
      console.log(`Migration ${file} completed successfully.`);
    }

    console.log('All migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
