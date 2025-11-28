const express = require('express');
const { adminSignup, adminLogin } = require('../controllers/adminAuthController');
const router = express.Router();

router.post('/signup', adminSignup);
router.post('/login', adminLogin);

module.exports = router;