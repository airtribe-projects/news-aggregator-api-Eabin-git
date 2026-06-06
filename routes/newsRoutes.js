const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getNews } = require('../controllers/newsController');

const router = express.Router();

router.get('/', authMiddleware, getNews);

module.exports = router;
