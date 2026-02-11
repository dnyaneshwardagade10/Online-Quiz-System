const { body, validationResult } = require('express-validator');

// Validate registration
const validateRegister = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'admin']).withMessage('Invalid role')
];

// Validate login
const validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Validate quiz creation
const validateQuiz = [
  body('title').trim().notEmpty().withMessage('Quiz title is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute')
];

// Validate question creation
const validateQuestion = [
  body('question_text').trim().notEmpty().withMessage('Question text is required'),
  body('question_type').isIn(['multiple_choice', 'true_false', 'short_answer']).withMessage('Invalid question type'),
  body('points').isInt({ min: 1 }).withMessage('Points must be at least 1')
];

// Validate option creation
const validateOption = [
  body('option_text').trim().notEmpty().withMessage('Option text is required'),
  body('is_correct').isBoolean().withMessage('is_correct must be boolean')
];

// Validate answer submission
const validateAnswer = [
  body('question_id').isInt().withMessage('Question ID must be integer'),
  body('answer_text').optional(),
  body('option_id').optional().isInt().withMessage('Option ID must be integer')
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateQuiz,
  validateQuestion,
  validateOption,
  validateAnswer,
  handleValidationErrors
};
