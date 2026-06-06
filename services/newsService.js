const NEWS_API_KEY = process.env.NEWS_API_KEY || 'cb7e21d9ea144c4dbcbf6c7d88254715';

const buildNewsQuery = (preferences) => {
  const normalized = preferences
    .filter(Boolean)
    .map((item) => item.toString().trim())
    .filter(Boolean);

  if (normalized.length === 0) {
    return 'latest';
  }

  return normalized.join(' OR ');
};

const buildNewsUrl = ({ query, pageSize, page, sortBy, language, from, to, domains }) => {
  let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&page=${page}&sortBy=${sortBy}&language=${language}&apiKey=${NEWS_API_KEY}`;

  if (from) {
    url += `&from=${encodeURIComponent(from)}`;
  }
  if (to) {
    url += `&to=${encodeURIComponent(to)}`;
  }
  if (domains) {
    url += `&domains=${encodeURIComponent(domains)}`;
  }

  return url;
};

const fetchNews = async ({ preferences, pageSize = 10, page = 1, sortBy = 'publishedAt', language = 'en', from, to, domains }) => {
  const query = buildNewsQuery(preferences);
  const url = buildNewsUrl({ query, pageSize, page, sortBy, language, from, to, domains });

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'news-aggregator-api',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`News API returned status ${response.status}`);
  }

  const data = await response.json();
  if (!data.articles || !Array.isArray(data.articles)) {
    throw new Error('Invalid news response');
  }

  return {
    articles: data.articles,
    totalResults: data.totalResults || 0,
    page,
    pageSize,
  };
};

const fallbackNews = (preferences) => {
  return preferences.map((topic, index) => ({
    title: `Sample ${topic} story ${index + 1}`,
    description: `This is a sample news item for ${topic}`,
    url: 'https://example.com',
    urlToImage: null,
    source: { name: 'Example News' },
    author: null,
    publishedAt: null,
    content: null,
  }));
};

module.exports = {
  fetchNews,
  fallbackNews,
};
