const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { verifyJWT, requireAdmin } = require('../middleware/auth');
const { validateQuiz, handleValidationErrors } = require('../middleware/validation');

// Quiz management (admin)
router.post('/', verifyJWT, requireAdmin, validateQuiz, handleValidationErrors, quizController.createQuiz);
router.get('/', verifyJWT, quizController.getAllQuizzes);
router.get('/:quizId', verifyJWT, quizController.getQuizById);
router.put('/:quizId', verifyJWT, requireAdmin, validateQuiz, handleValidationErrors, quizController.updateQuiz);
router.delete('/:quizId', verifyJWT, requireAdmin, quizController.deleteQuiz);

module.exports = router;
