// Import the Pool class from pg (node-postgres) to manage multiple concurrent database connections efficiently
const { Pool } = require('pg');
// Load environment variables for the connection string
require('dotenv').config();

// Initialize a new PostgreSQL connection pool configured to use the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('supabase') || process.env.NODE_ENV === 'production')
    ? { rejectUnauthorized: false }
    : false
});

// Attach a global error listener to the pool to catch logic failures or connection drops
// This prevents the application from crashing silently or stalling
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

module.exports = pool;
