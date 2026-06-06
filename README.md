# News Aggregator API

A RESTful API for a personalized news aggregator built with Node.js and Express.

## Features
- User signup and login with secure password hashing
- JWT token authentication
- User-specific news preferences
- External news retrieval with fallback content
- Input validation and error handling

## API Endpoints

### POST /users/signup
Register a new user.

Request body:
```json
{
  "name": "Clark Kent",
  "email": "clark@superman.com",
  "password": "Krypt()n8",
  "preferences": ["movies", "comics"]
}
```

### POST /users/login
Log in and receive a JWT token.

Request body:
```json
{
  "email": "clark@superman.com",
  "password": "Krypt()n8"
}
```

Response:
```json
{
  "token": "..."
}
```

### GET /users/preferences
Get the logged-in user's preferences.

Headers:
```
Authorization: Bearer <token>
```

### PUT /users/preferences
Update user preferences.

Request body:
```json
{
  "preferences": ["movies", "comics", "games"]
}
```

Headers:
```
Authorization: Bearer <token>
```

### GET /news
Get news articles based on user preferences using the NewsAPI `/v2/everything` endpoint.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (all optional):**
- `pageSize` - Number of results (1-100, default: 10)
- `page` - Page number (default: 1)
- `sortBy` - Sort order: `relevancy`, `popularity`, or `publishedAt` (default: publishedAt)
- `language` - 2-letter ISO code: en, es, fr, de, ar, ru, zh, pt, etc. (default: en)
- `from` - Start date (ISO 8601, e.g., 2026-06-01)
- `to` - End date (ISO 8601, e.g., 2026-06-05)
- `domains` - Comma-separated domains (e.g., bbc.com,techcrunch.com)

**Response:**
```json
{
  "news": [
    {
      "title": "Article title",
      "description": "Article description",
      "url": "https://example.com/article",
      "urlToImage": "https://example.com/image.jpg",
      "source": { "name": "Source Name" },
      "author": "Author Name",
      "publishedAt": "2026-06-05T10:30:00Z",
      "content": "Full article content..."
    }
  ],
  "totalResults": 5882,
  "page": 1,
  "pageSize": 10
}
```

**Example Requests:**
```bash
# Get latest tech news
GET /news?language=en&sortBy=publishedAt

# Get popular business news from specific domains
GET /news?sortBy=popularity&domains=bbc.com,techcrunch.com

# Get news from the past week, sorted by relevance
GET /news?from=2026-05-29&to=2026-06-05&sortBy=relevancy

# Pagination: Get page 2 with 20 results per page
GET /news?page=2&pageSize=20
```

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the API server:
   ```bash
   npm start
   ```
3. Run tests:
   ```bash
   npm test
   ```

## Configuration
The app uses the following environment variables if provided:
- `PORT` - server port (default: 3000)
- `JWT_SECRET` - secret for signing tokens
- `NEWS_API_KEY` - external news API key

If `NEWS_API_KEY` is not set, the app uses a default key.

## Notes
- The current implementation stores users in memory for the session.
- News is fetched from an external service, with sample fallback news if the API call fails.
