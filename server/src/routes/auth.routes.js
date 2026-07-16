const express = require('express');
const { login, signup } = require('../controllers/auth.controller');
const router = express.Router();

// Open endpoints, no authentication middleware required for signing in or creating instances
router.post('/login', login);
router.post('/signup', signup);

module.exports = router;
