const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getNews,
  markArticleRead,
  markArticleFavorite,
  getReadArticles,
  getFavoriteArticles,
  searchNews,
} = require('../controllers/newsController');

const router = express.Router();

router.get('/read', authMiddleware, getReadArticles);
router.get('/favorites', authMiddleware, getFavoriteArticles);
router.get('/search/:keyword', authMiddleware, searchNews);
router.post('/:id/read', authMiddleware, markArticleRead);
router.post('/:id/favorite', authMiddleware, markArticleFavorite);
router.get('/', authMiddleware, getNews);

module.exports = router;
