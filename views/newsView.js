const crypto = require('crypto');

const generateArticleId = (article) => {
  const fingerprint = article.url || `${article.title || ''}-${article.source?.name || ''}-${article.publishedAt || ''}`;
  return crypto.createHash('sha256').update(String(fingerprint)).digest('hex');
};

const formatArticle = (article) => ({
  id: generateArticleId(article),
  title: article.title || 'No title',
  description: article.description || 'No description',
  url: article.url || '',
  urlToImage: article.urlToImage || null,
  source: { name: article.source?.name || 'Unknown' },
  author: article.author || null,
  publishedAt: article.publishedAt || null,
  content: article.content || null,
});

const formatNewsResponse = (articles, totalResults, page, pageSize) => ({
  news: articles.map(formatArticle),
  totalResults,
  page,
  pageSize,
});

module.exports = {
  formatArticle,
  formatNewsResponse,
};
