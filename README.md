# MERA BHARAT

MERA BHARAT is a travel community for sharing stories and photographs, discovering destinations, and connecting with other travelers. The app uses React, Express, Node.js, and MongoDB.

## Requirements

- Node.js 22.12 or newer and npm
- MongoDB running locally or a MongoDB connection string
- MySQL is only needed when importing an existing PHP database

## Run locally

1. Copy `.env.example` to `.env` and set `SESSION_SECRET` to a long random value. Set `MONGODB_URI` if MongoDB is not running at the example local address.
2. Install dependencies from the repository root with `npm install`.
3. Start the API and Vite development server with `npm run dev`.
4. Open <http://localhost:5173>. The API runs at <http://localhost:4000> and Vite proxies `/api` and `/uploads` to it.

The app creates the MongoDB collections and indexes through Mongoose. Uploaded images are saved in `server/uploads/`, which is ignored by Git.

For a production build, run `npm run build`, set `NODE_ENV=production`, and start with `npm start`. Express serves the built React app and its API from the same origin. Use HTTPS in production so the session cookie is secure.

## Import the PHP/MySQL data

The checked-in `sql/IndianTourism.sql` has table definitions and no inserted records. To import a populated legacy database:

1. Back up the source database.
2. Set `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_DATABASE` in `.env`; set `MONGODB_URI` to the target database.
3. Start MongoDB, then run `npm run migrate:mysql`.

The importer can be rerun. It maps MySQL numeric user IDs to MongoDB references, imports posts, friendships, requests, and notifications, and writes supported JPEG, PNG, GIF, or WebP blobs to `server/uploads/imported/`. Existing bcrypt passwords are retained (PHP `$2y$` hashes are normalized); legacy plaintext passwords are immediately bcrypt-hashed during import so users can sign in with their existing password. Unsupported image blobs are skipped with a warning. MySQL contact messages are not in the checked-in schema and are not imported.

## Pages and functionality

- Public: landing, login, signup, Discover, contact, and terms. Discover combines destination inspiration, the image gallery, and the MERA BHARAT story; `/explore`, `/gallery`, and `/about` redirect there.
- Signed-in: community feed, traveler profiles, profile editing and photo upload, post creation/deletion, traveler search, friend requests, friend lists, and notifications.
- API reference: [API.md](API.md).

## Project layout

- `client/` — React and Vite application, with local site imagery in `client/public/assets/`.
- `server/` — Express API, MongoDB models, authentication, uploads, and REST routes.
- `migration/` — repeatable MySQL-to-MongoDB importer.
- `sql/` — legacy schema used as a reference by the importer; the checked-in dump has no records.

## Security and configuration

Passwords are bcrypt-hashed. Authentication uses HTTP-only, same-site session cookies stored in MongoDB. Mutating requests with an Origin header are checked against `CLIENT_ORIGIN`. Uploads are limited to 8 MB and common image MIME types. Configure secrets and database URLs through environment variables; never commit `.env`.
