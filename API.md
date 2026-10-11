# API reference

All routes are prefixed with `/api`. JSON errors use `{ "error": "..." }`. Signed-in routes use the `mera.sid` HTTP-only session cookie. For uploads, send `multipart/form-data` with the field name `image`.

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | API and MongoDB status |
| GET | `/auth/me` | Public | Current session user, or `null` |
| POST | `/auth/register` | Public | Create account; `name`, `email`, `username`, `password`, `acceptedTerms` |
| POST | `/auth/login` | Public | Sign in with `username` and `password` |
| POST | `/auth/logout` | Signed in | End session |
| GET | `/users/search?q=` | Signed in | Search name and username |
| GET | `/users/:username` | Signed in | Profile, posts, friends, relationship state |
| PATCH | `/users/me/profile` | Signed in | Set `status` and/or `location` |
| POST | `/users/me/avatar` | Signed in | Update profile image |
| GET | `/posts?username=` | Signed in | Feed or a profile's posts |
| POST | `/posts` | Signed in | Create a post with `content` and optional `image` |
| DELETE | `/posts/:postId` | Post owner | Delete a post |
| GET | `/friends` | Signed in | Friends, incoming/outgoing requests, and suggestions |
| POST | `/friends/requests/:userId` | Signed in | Send a friend request |
| POST | `/friends/requests/:userId/accept` | Signed in | Accept an incoming request |
| DELETE | `/friends/requests/:userId` | Signed in | Decline or cancel a request involving that user |
| DELETE | `/friends/:userId` | Signed in | Remove a friendship |
| GET | `/notifications` | Signed in | List notifications |
| PATCH | `/notifications/:notificationId/read` | Owner | Mark a notification read |
| POST | `/contact` | Public | Submit `name`, `email`, and `message` |
