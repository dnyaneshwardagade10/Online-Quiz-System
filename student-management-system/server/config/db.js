const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    uri: process.env.DB_URL, // Use connection string if available
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.DB_URL ? { rejectUnauthorized: false } : false // Enable SSL for cloud DBs
});

// Create database if it doesn't exist (initial setup helper)
const promisePool = pool.promise();

const initDB = async () => {
    try {
        // Skip DB creation if using a connection URL (Cloud DBs are usually pre-created)
        if (process.env.DB_URL) {
            console.log('Connected to Cloud Database');
            return;
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        console.log(`Database ${process.env.DB_NAME} checked/created.`);
        await connection.end();
    } catch (error) {
        console.error('Error creating database:', error);
    }
};

initDB();

module.exports = promisePool;
