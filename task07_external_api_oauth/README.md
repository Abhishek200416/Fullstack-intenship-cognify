# Task 7 — Advanced API Usage & External API Integration

- GitHub OAuth (Passport) — fetch your public repos after login
- Rate limiting (per IP) + centralized error handler
- Robust API boundaries

## Setup (GitHub OAuth)
Create an OAuth App at https://github.com/settings/developers
- Authorization callback URL: `http://localhost:3006/auth/github/callback`
- Copy Client ID and Secret

## Run
```bash
npm install
cp .env.example .env   # fill GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
npm run dev
# http://localhost:3006
```
