const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');
const { verifyJWT } = require('../middleware/auth');

// Quiz attempts
router.post('/:quizId/start', verifyJWT, attemptController.startAttempt);
router.post('/:resultId/submit', verifyJWT, attemptController.submitQuiz);
router.get('/user/history', verifyJWT, attemptController.getQuizHistory);
router.get('/:resultId', verifyJWT, attemptController.getResult);

module.exports = router;
