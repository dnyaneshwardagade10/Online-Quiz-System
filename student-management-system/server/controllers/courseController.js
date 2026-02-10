const db = require('../config/db');
const Joi = require('joi');

const courseSchema = Joi.object({
    course_name: Joi.string().required().min(3),
    course_code: Joi.string().required().min(3),
    credits: Joi.number().integer().min(1).max(5).required()
});

exports.getAllCourses = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM courses ORDER BY course_name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Course not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCourse = async (req, res) => {
    const { error } = courseSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { course_name, course_code, credits } = req.body;
        const [result] = await db.query(
            'INSERT INTO courses (course_name, course_code, credits) VALUES (?, ?, ?)',
            [course_name, course_code, credits]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Course code already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.updateCourse = async (req, res) => {
    const { error } = courseSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const { course_name, course_code, credits } = req.body;
        const [result] = await db.query(
            'UPDATE courses SET course_name=?, course_code=?, credits=? WHERE id=?',
            [course_name, course_code, credits, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Course not found' });
        res.json({ id: req.params.id, ...req.body });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Course code already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Course not found' });
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
