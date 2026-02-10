const pool = require('../config/database');

// Create question
const createQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { question, option_a, option_b, option_c, option_d, correct_option } = req.body;

    if (!question || !option_a || !option_b || !option_c || !option_d || !correct_option) {
      return res.status(400).json({ error: 'All fields are required' });
    }

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

    const [result] = await connection.query(
      `INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_option) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [quizId, question, option_a, option_b, option_c, option_d, correct_option]
    );

    connection.release();

    res.status(201).json({
      message: 'Question created successfully',
      questionId: result.insertId
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

// Get all questions for a quiz
const getQuestionsByQuiz = async (req, res) => {
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

    const [questions] = await connection.query(
      'SELECT * FROM questions WHERE quiz_id = ? ORDER BY id',
      [quizId]
    );

    connection.release();
    res.json(questions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

// Update question
const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { question, option_a, option_b, option_c, option_d, correct_option } = req.body;

    const connection = await pool.getConnection();

    // Verify question exists
    const [questions] = await connection.query(
      'SELECT id FROM questions WHERE id = ?',
      [questionId]
    );

    if (questions.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Question not found' });
    }

    const updateFields = [];
    const updateValues = [];

    if (question !== undefined) {
      updateFields.push('question = ?');
      updateValues.push(question);
    }
    if (option_a !== undefined) {
      updateFields.push('option_a = ?');
      updateValues.push(option_a);
    }
    if (option_b !== undefined) {
      updateFields.push('option_b = ?');
      updateValues.push(option_b);
    }
    if (option_c !== undefined) {
      updateFields.push('option_c = ?');
      updateValues.push(option_c);
    }
    if (option_d !== undefined) {
      updateFields.push('option_d = ?');
      updateValues.push(option_d);
    }
    if (correct_option !== undefined) {
      updateFields.push('correct_option = ?');
      updateValues.push(correct_option);
    }

    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(questionId);

    await connection.query(
      `UPDATE questions SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    connection.release();
    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const connection = await pool.getConnection();

    // Verify question exists
    const [questions] = await connection.query(
      'SELECT id FROM questions WHERE id = ?',
      [questionId]
    );

    if (questions.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Question not found' });
    }

    await connection.query('DELETE FROM questions WHERE id = ?', [questionId]);
    connection.release();

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

module.exports = {
  createQuestion,
  getQuestionsByQuiz,
  updateQuestion,
  deleteQuestion
};
