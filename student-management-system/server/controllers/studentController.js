const db = require('../config/db');
const Joi = require('joi');

// Joi Schema for Validation
const studentSchema = Joi.object({
    first_name: Joi.string().required().min(2),
    last_name: Joi.string().required().min(2),
    email: Joi.string().email().required(),
    dob: Joi.date().required(),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).optional(),
    address: Joi.string().optional().allow('')
});

exports.getAllStudents = async (req, res) => {
    try {
        const { search, sort } = req.query;
        let query = 'SELECT * FROM students';
        const params = [];

        if (search) {
            query += ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (sort) {
            // Allow sorting by specific fields only to prevent SQL injection
            const allowedSorts = ['first_name', 'last_name', 'created_at'];
            if (allowedSorts.includes(sort)) {
                query += ` ORDER BY ${sort}`;
            }
        } else {
            query += ' ORDER BY created_at DESC';
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Student not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createStudent = async (req, res) => {
    const { error } = studentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { first_name, last_name, email, dob, phone, address } = req.body;
        const [result] = await db.query(
            'INSERT INTO students (first_name, last_name, email, dob, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, dob, phone, address]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.updateStudent = async (req, res) => {
    const { error } = studentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { first_name, last_name, email, dob, phone, address } = req.body;
        const [result] = await db.query(
            'UPDATE students SET first_name=?, last_name=?, email=?, dob=?, phone=?, address=? WHERE id=?',
            [first_name, last_name, email, dob, phone, address, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
        res.json({ id: req.params.id, ...req.body });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
