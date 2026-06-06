const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'news-secret-key';
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'cb7e21d9ea144c4dbcbf6c7d88254715';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = new Map();

const validateSignup = (body) => {
  if (!body.name || !body.email || !body.password) {
    return 'name, email, and password are required';
  }
  if (!Array.isArray(body.preferences)) {
    return 'preferences must be an array';
  }
  return null;
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = users.get(payload.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

app.post('/users/signup', async (req, res) => {
  const validationError = validateSignup(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { name, email, password, preferences } = req.body;
  if (users.has(email)) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.set(email, {
    name,
    email,
    passwordHash,
    preferences,
  });

  return res.status(200).json({ message: 'Signup successful' });
});

app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = users.get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '2h' });
  return res.status(200).json({ token });
});

app.get('/users/preferences', authMiddleware, (req, res) => {
  return res.status(200).json({ preferences: req.user.preferences });
});

app.put('/users/preferences', authMiddleware, (req, res) => {
  const { preferences } = req.body;
  if (!Array.isArray(preferences)) {
    return res.status(400).json({ error: 'preferences must be an array' });
  }

  req.user.preferences = preferences;
  users.set(req.user.email, req.user);
  return res.status(200).json({ preferences: req.user.preferences });
});

const buildNewsQuery = (preferences) => {
  const normalized = preferences.filter(Boolean).map((item) => item.toString().trim()).filter(Boolean);
  if (normalized.length === 0) {
    return 'latest';
  }
  return normalized.join(' OR ');
};

const fallbackNews = (preferences) => {
  return preferences.map((topic, index) => ({
    title: `Sample ${topic} story ${index + 1}`,
    description: `This is a sample news item for ${topic}`,
    url: 'https://example.com',
    source: { name: 'Example News' },
  }));
};

app.get('/news', authMiddleware, async (req, res) => {
  const preferences = req.user.preferences || ['latest'];
  const query = buildNewsQuery(preferences);
  
  const pageSize = Math.min(parseInt(req.query.pageSize) || 10, 100);
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const sortBy = req.query.sortBy || 'publishedAt';
  const language = req.query.language || 'en';
  const from = req.query.from || undefined;
  const to = req.query.to || undefined;
  const domains = req.query.domains || undefined;
  
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

  try {
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

    const news = data.articles.map((article) => ({
      title: article.title || 'No title',
      description: article.description || 'No description',
      url: article.url || '',
      urlToImage: article.urlToImage || null,
      source: { name: article.source?.name || 'Unknown' },
      author: article.author || null,
      publishedAt: article.publishedAt || null,
      content: article.content || null,
    }));
    return res.status(200).json({ 
      news,
      totalResults: data.totalResults || 0,
      page,
      pageSize,
    });
  } catch (error) {
    const news = fallbackNews(preferences);
    return res.status(200).json({ news, totalResults: news.length, page: 1, pageSize });
  }
});

if (require.main === module) {
  app.listen(port, (err) => {
    if (err) {
      return console.error('Something bad happened', err);
    }
    console.log(`Server is listening on ${port}`);
  });
}

module.exports = app;