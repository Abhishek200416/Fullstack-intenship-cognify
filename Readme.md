🚀 Cognifyz Internship — Full Stack Development (Tasks 1–8)

This repository documents my 6-hour sprint through all 8 major tasks of the Cognifyz Full Stack Development Internship Program.

The internship focused on progressive learning, starting from basic server-side rendering (SSR) and front-end validation, scaling up to database integration, authentication, OAuth, external APIs, caching, background jobs, and advanced server-side intelligence made in 6hrs.

📂 Repository Structure
Alltaskes/
├── task01_basic_ssr_form/
├── task02_inline_styles_validation/
├── task03_responsive_css/
├── task04_dom_validation_router/
├── task05_api_crud_frontend/
├── task06_db_auth/
├── task07_external_api_oauth/
└── task08_middleware_jobs_cache/


Each folder is a self-contained project with its own package.json, .env, and src/ + public/ code.

✅ Task Breakdown
Task 1 — Basic SSR Form

Server-Side Rendering using Express + EJS

Form submission handling, displaying processed results

Task 2 — Inline Styles + Validation

Inline styled form UI

Client + server validation

Submission listing

Task 3 — Responsive CSS

Front-end layout with mobile-first responsiveness

Styled via styles.css for clean separation

Static site served via Express

Task 4 — DOM Validation + Router

Mini Single-Page Application (SPA) with client-side router

DOM manipulation + form validation

Theme toggling and sticky footer

Task 5 — API CRUD + Frontend Integration

Built a RESTful API (CRUD with Express)

Frontend interacts with API via Fetch

Tasks (items) list with Add / Update / Delete

Task 6 — Database + Authentication

Integrated Sequelize + SQLite

User registration, login, logout with JWT + cookies

Notes app: secure, user-specific CRUD

Authentication middleware for protected routes

Task 7 — External API + OAuth

GitHub OAuth login using Passport.js

Secure session-based auth

Fetched and displayed user repositories via GitHub REST API

Rate limiting + Helmet security headers

Task 8 — Middleware, Jobs, Caching

Advanced server-side:

Middleware: Helmet, compression, logging

Background jobs + cron scheduler

API caching with apicache

Health checks, graceful shutdown

Exposed endpoints:

/api/health → server status

/api/report → cron-built report

/api/heavy → cached heavy compute

/api/enqueue + /api/job/:id → async job queue

🔑 Internship Learning Outcomes

Through these tasks, I gained hands-on expertise in:

Front-end development (HTML, CSS, JS, DOM, SPA concepts)

Back-end APIs (Express.js, RESTful design, middleware)

Database integration (Sequelize ORM, SQLite)

Authentication & Security (JWT, Passport OAuth, Helmet)

External API consumption (GitHub API, secure OAuth flows)

Performance & Scalability (caching, background jobs, rate limiting, logging)

🛠️ How to Run

Each task can be run independently:

cd task0X_name
npm install
npm run dev   # or npm start


Then visit the localhost port defined (varies per task).

🌟 About the Program

Cognifyz Internship Program — Full Stack Development
A structured, practical internship where I built end-to-end applications progressing from simple SSR to advanced full-stack apps with external APIs, secure auth, and server optimization techniques.

All tasks were completed in 6 hours straight, demonstrating focus, speed, and adaptability in full-stack problem-solving.# Fullstack-intenship-cognify
