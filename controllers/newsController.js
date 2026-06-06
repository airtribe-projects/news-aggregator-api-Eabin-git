const { fetchNews, fallbackNews } = require('../services/newsService');
const { formatNewsResponse } = require('../views/newsView');

const getNews = async (req, res) => {
  const preferences = req.user.preferences || ['latest'];
  const pageSize = req.query.pageSize;
  const page = req.query.page;
  const sortBy = req.query.sortBy;
  const language = req.query.language;
  const from = req.query.from;
  const to = req.query.to;
  const domains = req.query.domains;

  try {
    const result = await fetchNews({
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
    const pageSizeValue = Math.min(parseInt(req.query.pageSize, 10) || 10, 100);
    return res.status(200).json(formatNewsResponse(fallback, fallback.length, 1, pageSizeValue));
  }
};

module.exports = {
  getNews,
};
