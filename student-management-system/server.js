const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const studentRoutes = require('./server/routes/studentRoutes');
const courseRoutes = require('./server/routes/courseRoutes');
const enrollmentRoutes = require('./server/routes/enrollmentRoutes');
const db = require('./server/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve frontend files

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// Test Route
app.get('/test', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.json({ message: 'Database connected!', solution: rows[0].solution });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Initialize Schema (Simple approach for this task)
const initSchema = async () => {
    try {
        // Users Table
        await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff') DEFAULT 'staff'
      )
    `);

        // Students Table
        await db.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        dob DATE NOT NULL,
        phone VARCHAR(15),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Courses Table
        await db.query(`
        CREATE TABLE IF NOT EXISTS courses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_name VARCHAR(100) NOT NULL,
            course_code VARCHAR(20) UNIQUE NOT NULL,
            credits INT NOT NULL
        )
    `);

        // Enrollments
        await db.query(`
        CREATE TABLE IF NOT EXISTS enrollments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT,
            course_id INT,
            enrollment_date DATE DEFAULT (CURRENT_DATE),
            grade VARCHAR(5),
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
        )
    `);

        console.log("Tables initialized");
    } catch (error) {
        console.error("Schema initialization error:", error);
    }
};

app.listen(PORT, async () => {
    await initSchema();
    console.log(`Server running on http://localhost:${PORT}`);
});
