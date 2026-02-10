const pool = require('../config/database');

// Start quiz attempt - Create a results record
const startAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.userId;

    const connection = await pool.getConnection();

    // Check if quiz exists
    const [quizzes] = await connection.query(
      'SELECT duration FROM quizzes WHERE id = ?',
      [quizId]
    );

    if (quizzes.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if user already has a result for this quiz
    const [existingResults] = await connection.query(
      `SELECT id FROM results WHERE quiz_id = ? AND user_id = ?`,
      [quizId, userId]
    );

    if (existingResults.length > 0) {
      connection.release();
      return res.status(400).json({ 
        error: 'You have already taken this quiz',
        resultId: existingResults[0].id
      });
    }

    // Create new result record
    const [result] = await connection.query(
      `INSERT INTO results (quiz_id, user_id, score) VALUES (?, ?, 0)`,
      [quizId, userId]
    );

    const endTime = new Date(Date.now() + quizzes[0].duration * 60000);

    connection.release();

    res.status(201).json({
      message: 'Quiz attempt started',
      resultId: result.insertId,
      duration: quizzes[0].duration,
      endTime: endTime.toISOString()
    });
  } catch (error) {
    console.error('Start attempt error:', error);
    res.status(500).json({ error: 'Failed to start quiz attempt' });
  }
};

// Submit quiz and calculate score
const submitQuiz = async (req, res) => {
  try {
    const { resultId } = req.params;
    const { answers } = req.body; // answers should be array of {questionId, selectedOption}

    const connection = await pool.getConnection();

    // Verify result exists and belongs to user
    const [results] = await connection.query(
      'SELECT quiz_id, user_id FROM results WHERE id = ? AND user_id = ?',
      [resultId, req.user.userId]
    );

    if (results.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Quiz result not found' });
    }

    const { quiz_id } = results[0];

    // Calculate score
    let score = 0;
    const maxScore = answers.length;

    for (const answer of answers) {
      const [questions] = await connection.query(
        'SELECT correct_option FROM questions WHERE id = ? AND quiz_id = ?',
        [answer.questionId, quiz_id]
      );

      if (questions.length > 0 && questions[0].correct_option === answer.selectedOption) {
        score++;
      }
    }

    // Update result with score
    const percentage = (score / maxScore) * 100;
    await connection.query(
      'UPDATE results SET score = ? WHERE id = ?',
      [percentage, resultId]
    );

    connection.release();

    res.json({
      message: 'Quiz submitted successfully',
      score: percentage,
      passed: percentage >= 60 // 60% is passing
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

// Get user quiz history
const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const connection = await pool.getConnection();

    const [results] = await connection.query(
      `SELECT r.*, q.title, q.duration 
       FROM results r
       JOIN quizzes q ON r.quiz_id = q.id
       WHERE r.user_id = ?
       ORDER BY r.taken_at DESC`,
      [userId]
    );

    connection.release();
    res.json(results);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz history' });
  }
};

// Get specific result
const getResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const connection = await pool.getConnection();

    const [results] = await connection.query(
      `SELECT r.*, q.title, q.duration 
       FROM results r
       JOIN quizzes q ON r.quiz_id = q.id
       WHERE r.id = ? AND r.user_id = ?`,
      [resultId, req.user.userId]
    );

    if (results.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Result not found' });
    }

    connection.release();
    res.json(results[0]);
  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
};

module.exports = {
  startAttempt,
  submitQuiz,
  getQuizHistory,
  getResult
};
