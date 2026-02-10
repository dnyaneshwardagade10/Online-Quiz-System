const pool = require('../config/database');

// Create new quiz
const createQuiz = async (req, res) => {
  try {
    const { title, duration } = req.body;

    if (!title || !duration) {
      return res.status(400).json({ error: 'Title and duration are required' });
    }

    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO quizzes (title, duration) VALUES (?, ?)`,
      [title, parseInt(duration)]
    );

    connection.release();

    res.status(201).json({
      message: 'Quiz created successfully',
      quizId: result.insertId
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
};

// Get all quizzes
const getAllQuizzes = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [quizzes] = await connection.query(
      `SELECT * FROM quizzes ORDER BY created_at DESC`
    );

    connection.release();
    res.json(quizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

// Get quiz by ID with questions
const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const connection = await pool.getConnection();

    // Get quiz details
    const [quizzes] = await connection.query(
      'SELECT * FROM quizzes WHERE id = ?',
      [quizId]
    );

    if (quizzes.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = quizzes[0];

    // Get all questions
    const [questions] = await connection.query(
      'SELECT id, quiz_id, question, option_a, option_b, option_c, option_d, correct_option FROM questions WHERE quiz_id = ? ORDER BY id',
      [quizId]
    );

    connection.release();

    res.json({
      ...quiz,
      questions
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

// Update quiz
const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, duration } = req.body;

    const connection = await pool.getConnection();

    // Verify quiz exists
    const [quizzes] = await connection.query(
      'SELECT id FROM quizzes WHERE id = ?',
      [quizId]
    );

    if (quizzes.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (duration !== undefined) {
      updateFields.push('duration = ?');
      updateValues.push(parseInt(duration));
    }

    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(quizId);

    await connection.query(
      `UPDATE quizzes SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    connection.release();
    res.json({ message: 'Quiz updated successfully' });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
};

// Delete quiz
const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const connection = await pool.getConnection();

    // Verify quiz exists
    const [quizzes] = await connection.query(
      'SELECT id FROM quizzes WHERE id = ?',
      [quizId]
    );

    if (quizzes.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Quiz not found' });
    }

    await connection.query('DELETE FROM quizzes WHERE id = ?', [quizId]);
    connection.release();

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz
};
