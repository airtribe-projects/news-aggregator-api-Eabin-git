# News Aggregator API - Step-by-Step Starter Guide

This guide explains how to start and complete the News Aggregator API project using simple steps. It is written for anyone with basic coding skills.

## 1. What this project does
- Builds a REST API using Node.js and Express.
- Lets users sign up and log in securely.
- Stores user preferences for news topics.
- Fetches news articles based on those preferences.
- Uses JWT tokens so only logged-in users can access preferences and news.

## 2. What you need to run it
- Node.js 18 or newer installed.
- A terminal or command prompt.
- The project folder available on your computer.

## 3. How to start the project
1. Open the project folder in the terminal.
2. Run `npm install` to install the code dependencies.
3. Run `npm start` to launch the API server.
4. The server will start on port 3000 by default.

## 4. How to use the API
### Sign up a new user
- Send a POST request to `/users/signup`
- Example JSON body:
  ```json
  {
    "name": "Clark Kent",
    "email": "clark@superman.com",
    "password": "Krypt()n8",
    "preferences": ["movies", "comics"]
  }
  ```

### Log in
- Send a POST request to `/users/login`
- Example JSON body:
  ```json
  {
    "email": "clark@superman.com",
    "password": "Krypt()n8"
  }
  ```
- The response will include a `token`.

### Get preferences
- Send a GET request to `/users/preferences`
- Include `Authorization: Bearer <token>` in the request header.

### Update preferences
- Send a PUT request to `/users/preferences`
- Include `Authorization: Bearer <token>` in the header.
- Example body:
  ```json
  {
    "preferences": ["movies", "comics", "games"]
  }
  ```

### Get news
- Send a GET request to `/news`
- Include `Authorization: Bearer <token>` in the header.
- The API returns news articles based on the user preferences.
- Optional query parameters:
  - `pageSize` - Number of results per page (1-100, default: 10)
  - `page` - Page number for pagination (default: 1)
  - `sortBy` - Sort by relevancy, popularity, or publishedAt (default: publishedAt)
  - `language` - 2-letter language code (en, es, fr, de, etc. default: en)
  - `from` - Start date in ISO 8601 format (e.g., 2026-06-01)
  - `to` - End date in ISO 8601 format (e.g., 2026-06-05)
  - `domains` - Comma-separated list of news sources (e.g., bbc.com,techcrunch.com)

## 5. What happens behind the scenes
- User data is saved temporarily while the server is running.
- Passwords are protected using hashing.
- Login returns a secure token that must be sent with protected requests.
- The `/news` route calls an external news service using the provided API key.

## 6. How to check the project is working
- Run `npm test` in the project folder.
- If all tests pass, the API is working correctly.

## 7. Extra note for beginners
- You do not need to edit the code to run the project.
- Just follow the commands: `npm install`, `npm start`, then use the API routes.
- Use tools like Postman or Insomnia to send requests if you are not comfortable with the terminal.
