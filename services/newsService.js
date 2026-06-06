const axios = require('axios');
const { formatArticle } = require('../views/newsView');

const NEWS_API_KEY = process.env.NEWS_API_KEY || 'cb7e21d9ea144c4dbcbf6c7d88254715';
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_REFRESH_INTERVAL = 60 * 1000;

const cache = new Map();
const articleStore = new Map();

const normalizePreferences = (preferences = []) => {
  return (preferences || [])
    .filter(Boolean)
    .map((item) => item.toString().trim())
    .filter(Boolean);
};

const buildCacheKey = ({ query, preferences, pageSize = 10, page = 1, sortBy = 'publishedAt', language = 'en', from = '', to = '', domains = '' }) => {
  return JSON.stringify({
    query: query ? String(query).trim() : null,
    preferences: normalizePreferences(preferences),
    pageSize,
    page,
    sortBy,
    language,
    from: from || null,
    to: to || null,
    domains: domains || null,
  });
};

const indexArticles = (articles) => {
  articles.forEach((article) => {
    if (article && article.id) {
      articleStore.set(article.id, article);
    }
  });
};

const fallbackNews = (preferences) => {
  const sourceTopics = normalizePreferences(preferences).length > 0 ? normalizePreferences(preferences) : ['latest'];
  const articles = sourceTopics.map((topic, index) =>
    formatArticle({
      title: `Sample ${topic} story ${index + 1}`,
      description: `This is a sample news item for ${topic}`,
      url: `https://example.com/${encodeURIComponent(topic)}/${index + 1}`,
      urlToImage: null,
      source: { name: 'Example News' },
      author: null,
      publishedAt: null,
      content: null,
    })
  );

  indexArticles(articles);
  return articles;
};

const buildNewsQuery = (preferences) => {
  const normalized = normalizePreferences(preferences);
  if (normalized.length === 0) {
    return 'latest';
  }
  return normalized.join(' OR ');
};

const fetchNews = async ({ query, preferences, pageSize = 10, page = 1, sortBy = 'publishedAt', language = 'en', from, to, domains }) => {
  try {
    const searchQuery = query ? String(query).trim() : buildNewsQuery(preferences || []);

    const params = {
      q: searchQuery,
      pageSize,
      page,
      sortBy,
      language,
      apiKey: NEWS_API_KEY,
    };

    if (from) params.from = from;
    if (to) params.to = to;
    if (domains) params.domains = domains;

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params,
      headers: {
        'User-Agent': 'news-aggregator-api',
        Accept: 'application/json',
      },
      timeout: 10000,
    });

    if (!response.data.articles || !Array.isArray(response.data.articles)) {
      throw new Error('Invalid news response: articles not found');
    }

    const articles = response.data.articles.map(formatArticle);
    indexArticles(articles);

    return {
      articles,
      totalResults: response.data.totalResults || 0,
      page,
      pageSize,
    };
  } catch (error) {
    if (error.response) {
      throw new Error(`News API error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      throw new Error('News API request failed: No response received');
    }
    throw new Error(`News API error: ${error.message}`);
  }
};

const getCachedNews = async (params) => {
  const key = buildCacheKey(params);
  const entry = cache.get(key);

  if (entry && Date.now() - entry.updatedAt < CACHE_TTL) {
    return entry.result;
  }

  const result = await fetchNews(params);
  cache.set(key, {
    params,
    result,
    updatedAt: Date.now(),
  });
  return result;
};

const refreshCacheEntry = async (key, entry) => {
  try {
    const result = await fetchNews(entry.params);
    cache.set(key, {
      params: entry.params,
      result,
      updatedAt: Date.now(),
    });
  } catch (error) {
    // Keep stale cache if refresh fails.
  }
};

const scheduleCacheRefresh = () => {
  const interval = setInterval(async () => {
    for (const [key, entry] of cache.entries()) {
      await refreshCacheEntry(key, entry);
    }
  }, CACHE_REFRESH_INTERVAL);

  if (interval && typeof interval.unref === 'function') {
    interval.unref();
  }
};

scheduleCacheRefresh();

const getArticleById = (id) => articleStore.get(id) || null;

const searchArticles = async ({ keyword, preferences, pageSize = 10, page = 1, sortBy = 'publishedAt', language = 'en', from, to, domains }) => {
  const trimmedKeyword = String(keyword || '').trim();
  if (!trimmedKeyword) {
    return {
      articles: [],
      totalResults: 0,
      page,
      pageSize,
    };
  }

  const matches = Array.from(articleStore.values()).filter((article) => {
    const combined = `${article.title} ${article.description} ${article.content}`.toLowerCase();
    return combined.includes(trimmedKeyword.toLowerCase());
  });

  if (matches.length > 0) {
    return {
      articles: matches.slice((page - 1) * pageSize, page * pageSize),
      totalResults: matches.length,
      page,
      pageSize,
    };
  }

  try {
    return await getCachedNews({ query: trimmedKeyword, preferences, pageSize, page, sortBy, language, from, to, domains });
  } catch (error) {
    const fallback = fallbackNews([trimmedKeyword]);
    return {
      articles: fallback,
      totalResults: fallback.length,
      page,
      pageSize,
    };
  }
};

const getAllCachedArticles = () => Array.from(articleStore.values());

module.exports = {
  fetchNews,
  getCachedNews,
  fallbackNews,
  searchArticles,
  getArticleById,
  getAllCachedArticles,
};
