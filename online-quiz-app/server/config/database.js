const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
let dbConfig;

if (process.env.DB_URL) {
  console.log("Using Cloud Database Connection");
  dbConfig = {
    uri: process.env.DB_URL,
    ssl: { rejectUnauthorized: false }, // Required for Aiven
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true
  };
} else {
  console.log("Using Local Database Connection");
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true
  };
}

const pool = mysql.createPool(dbConfig);

// Test connection once
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
  }
})();

module.exports = pool;
