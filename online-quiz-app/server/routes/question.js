const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { verifyJWT } = require('../middleware/auth');

// Question management
router.post('/:quizId/questions', verifyJWT, questionController.createQuestion);
router.get('/:quizId/questions', verifyJWT, questionController.getQuestionsByQuiz);
router.put('/:questionId', verifyJWT, questionController.updateQuestion);
router.delete('/:questionId', verifyJWT, questionController.deleteQuestion);

module.exports = router;
