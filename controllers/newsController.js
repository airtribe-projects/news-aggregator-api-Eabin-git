const { getCachedNews, searchArticles, getArticleById, fallbackNews } = require('../services/newsService');
const { formatNewsResponse } = require('../views/newsView');
const { updateUser } = require('../models/userModel');

const parseQueryInt = (value, defaultValue) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

const getNews = async (req, res) => {
  const preferences = req.user.preferences || ['latest'];
  const pageSize = parseQueryInt(req.query.pageSize, 10);
  const page = parseQueryInt(req.query.page, 1);
  const sortBy = req.query.sortBy || 'publishedAt';
  const language = req.query.language || 'en';
  const from = req.query.from;
  const to = req.query.to;
  const domains = req.query.domains;

  try {
    const result = await getCachedNews({
      preferences,
      pageSize,
      page,
      sortBy,
      language,
      from,
      to,
      domains,
    });

    return res.status(200).json(
      formatNewsResponse(result.articles, result.totalResults, result.page, result.pageSize)
    );
  } catch (error) {
    const fallback = fallbackNews(preferences);
    return res.status(200).json(formatNewsResponse(fallback, fallback.length, 1, pageSize));
  }
};

const markArticleRead = (req, res) => {
  const article = getArticleById(req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const readArticles = new Set([...(req.user.readArticles || []), article.id]);
  const updatedUser = updateUser(req.user.email, { readArticles: Array.from(readArticles) });

  return res.status(200).json({ readArticles: updatedUser.readArticles });
};

const markArticleFavorite = (req, res) => {
  const article = getArticleById(req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const favoriteArticles = new Set([...(req.user.favoriteArticles || []), article.id]);
  const updatedUser = updateUser(req.user.email, { favoriteArticles: Array.from(favoriteArticles) });

  return res.status(200).json({ favoriteArticles: updatedUser.favoriteArticles });
};

const getReadArticles = (req, res) => {
  const ids = req.user.readArticles || [];
  const articles = ids.map(getArticleById).filter(Boolean);
  return res.status(200).json({ news: articles, totalResults: articles.length });
};

const getFavoriteArticles = (req, res) => {
  const ids = req.user.favoriteArticles || [];
  const articles = ids.map(getArticleById).filter(Boolean);
  return res.status(200).json({ news: articles, totalResults: articles.length });
};

const searchNews = async (req, res) => {
  const keyword = String(req.params.keyword || '').trim();
  if (!keyword) {
    return res.status(400).json({ error: 'Search keyword is required' });
  }

  const preferences = req.user.preferences || ['latest'];
  const pageSize = parseQueryInt(req.query.pageSize, 10);
  const page = parseQueryInt(req.query.page, 1);
  const sortBy = req.query.sortBy || 'publishedAt';
  const language = req.query.language || 'en';
  const from = req.query.from;
  const to = req.query.to;
  const domains = req.query.domains;

  const result = await searchArticles({
    keyword,
    preferences,
    pageSize,
    page,
    sortBy,
    language,
    from,
    to,
    domains,
  });

  return res.status(200).json(
    formatNewsResponse(result.articles, result.totalResults, result.page, result.pageSize)
  );
};

module.exports = {
  getNews,
  markArticleRead,
  markArticleFavorite,
  getReadArticles,
  getFavoriteArticles,
  searchNews,
};
