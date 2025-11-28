const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { studentSignup, studentLogin, allStudents, getStudentById, deleteStudent, enrollCourse, checkEnrollment,  } = require('../controllers/studentAuthController');
const { studentProtect } = require('../studentMiddleware');

router.post('/signup', studentSignup);
router.post('/login', studentLogin);
router.post("/enroll/:courseId", studentProtect ,enrollCourse);
router.get('/all', allStudents);
router.get('/:id', getStudentById);
router.get("/enroll/check/:courseId", studentProtect, checkEnrollment);
router.delete('/delete/:id', deleteStudent);


module.exports = router;