const db = require('../config/db');

exports.enrollStudent = async (req, res) => {
    try {
        const { student_id, course_id } = req.body;

        // simple validation
        if (!student_id || !course_id) {
            return res.status(400).json({ error: 'Student ID and Course ID are required' });
        }

        const [result] = await db.query(
            'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
            [student_id, course_id]
        );
        res.status(201).json({ message: 'Enrollment successful', enrollment_id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') { // Assuming unique composite index if added
            return res.status(400).json({ error: 'Student already enrolled in this course' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.getEnrollments = async (req, res) => {
    try {
        const query = `
            SELECT e.id, s.first_name, s.last_name, c.course_name, c.course_code, e.enrollment_date, e.grade
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN courses c ON e.course_id = c.id
            ORDER BY e.enrollment_date DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStudentEnrollments = async (req, res) => {
    try {
        const query = `
            SELECT c.course_name, c.course_code, c.credits, e.enrollment_date, e.grade
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE e.student_id = ?
        `;
        const [rows] = await db.query(query, [req.params.studentId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteEnrollment = async (req, res) => { // Unenroll
    try {
        const [result] = await db.query('DELETE FROM enrollments WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Enrollment not found' });
        res.json({ message: 'Unenrolled successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
