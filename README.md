# CloudSek Assignment - Posts & Comments API

## Overview
A Node.js (Express) backend with JWT authentication that allows users to create posts and add text comments. MongoDB is used for storage. Optional rich text field is supported on comments.

## Note for the BONUS Feature:
I have implemented the support for adding rich text in comments. At present, formatting is stored in markdown-style syntax (e.g., **bold** for bold text, *italic* for italics and [link] for any addd hyperlink). This ensures flexibility for the frontend to render styled text as needed. The backend correctly stores and retrieves this format.


## Loom Demo video link
https://www.loom.com/share/1d80113714ef44ed968ee7e061442f3b?sid=29de0910-da42-43fd-b371-6931eacebf81

## High Level Architecture
<img width="921" height="613" alt="image" src="https://github.com/user-attachments/assets/3bb75f72-44e7-46f9-bb6c-c57bd67ff2fe" />

## Render Backend BaseURL
https://cloudsek-backend-assignment.onrender.com/


## Why MongoDB
- Flexible document model fits posts and nested comments well
- Simple to reason about object IDs and relations
- Good developer ergonomics with the official driver

## Tech Stack
- Node.js, Express
- MongoDB (official driver)
- JWT for auth

## Setup
1. Prerequisites: Node 20+, MongoDB instance/URI
2. Environment variables (create `.env` in `Backend/`):
```
PORT=3000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=super_secret_value
```
3. Install and run (from `Backend/`):
```
npm install
node index.js
```

## API
All responses are JSON. Send JWT in `x-auth-token` header for protected routes.

### Auth
- POST `/api/auth/register` { username, email, password }
- POST `/api/auth/login` { email, password } → { token }

### Posts
- POST `/api/posts` (auth) { title, content } → { postId }
- GET `/api/posts?skip=0&limit=20`
- GET `/api/posts/:id`
- PUT `/api/posts/:id` (auth, author only) { title?, content? }
- DELETE `/api/posts/:id` (auth, author only)

### Comments
- POST `/api/:postId/comments` (auth) { text, richText? } → { commentId }
- GET `/api/:postId/comments?skip=0&limit=50` — lists top-level comments only
- PUT `/api/comments/:id` (auth, author only) { text?, richText? }
- DELETE `/api/comments/:id` (auth, author only)

### Replies (nested comments)
- POST `/api/comments/:id/replies` (auth) { text, richText? } → { commentId } — creates a reply to comment `:id`
- GET `/api/comments/:id/replies?skip=0&limit=50` — lists replies for comment `:id`

## Swagger Docs
- After starting the server, open `http://localhost:3000/api-docs`
- Use the Authorize button and enter your JWT in the `x-auth-token` field
- The spec file is at `Backend/openapi.json`

## Notes
- Comments are stored in a `comments` collection referencing `posts` by `postId`.
- Replies have `parentCommentId` pointing to the parent comment; top-level comments have it set to `null`.
- Rich text is optional and stored alongside plain text when provided.
- Minimal validation is implemented; extend as needed. 
