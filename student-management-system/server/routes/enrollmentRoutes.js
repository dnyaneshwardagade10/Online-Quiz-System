const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

router.post('/', enrollmentController.enrollStudent);
router.get('/', enrollmentController.getEnrollments); // Admin view (all)
router.get('/student/:studentId', enrollmentController.getStudentEnrollments);
router.delete('/:id', enrollmentController.deleteEnrollment);

module.exports = router;
