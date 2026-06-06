const express = require('express');
const { signup, login, getPreferences, updatePreferences } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', signup);
router.post('/signup', signup); // Alias for backward compatibility
router.post('/login', login);
router.get('/preferences', authMiddleware, getPreferences);
router.put('/preferences', authMiddleware, updatePreferences);

module.exports = router;
