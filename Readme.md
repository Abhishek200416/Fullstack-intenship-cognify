# 🚀 Cognifyz Internship — Full Stack Development (Tasks 1–8)

This repository documents my **6-hour sprint** through all **8 major tasks** of the Cognifyz **Full Stack Development Internship Program**.  

The program was designed to progressively build full-stack expertise — starting from basic server-side rendering and validation, advancing toward APIs, databases, authentication, OAuth integrations, caching, background jobs, and advanced server-side intelligence.

---

## 📂 Repository Structure

Alltaskes/
├── task01_basic_ssr_form/
├── task02_inline_styles_validation/
├── task03_responsive_css/
├── task04_dom_validation_router/
├── task05_api_crud_frontend/
├── task06_db_auth/
├── task07_external_api_oauth/
└── task08_middleware_jobs_cache/

Each folder is a self-contained project with its own **package.json**, **.env**, and **src/ + public/** code.

---

## ✅ Task Breakdown

### Task 1 — Basic SSR Form
- Built with **Express + EJS**.  
- Implemented **server-side rendering**.  
- Form submission + processed results displayed.

---

### Task 2 — Inline Styles + Validation
- Created inline styled form UI.  
- Added **client-side + server-side validation**.  
- Submission listing with history.

---

### Task 3 — Responsive CSS
- **Mobile-first responsive** layout.  
- Styles isolated in **styles.css**.  
- Served as a static site via Express.

---

### Task 4 — DOM Validation + Router
- Built a mini **Single-Page Application (SPA)** with client-side routing.  
- DOM manipulation for validation.  
- Theme toggling + sticky footer.

---

### Task 5 — API CRUD + Frontend Integration
- Developed a **RESTful API** with Express.  
- Implemented **CRUD (Create, Read, Update, Delete)** operations.  
- Frontend connected using Fetch API.  
- Task list UI with Add/Update/Delete support.

---

### Task 6 — Database + Authentication
- Integrated **Sequelize + SQLite**.  
- Implemented **user authentication (register, login, logout)**.  
- Used **JWT + cookies** for session handling.  
- Built a secure **notes app** with user-specific CRUD.  
- Authentication middleware protects routes.

---

### Task 7 — External API + OAuth
- Integrated **GitHub OAuth** with Passport.js.  
- Implemented **secure session-based login**.  
- Pulled user repositories from **GitHub REST API**.  
- Added **Helmet security headers** + **rate limiting**.

---

### Task 8 — Middleware, Jobs, Caching
- Advanced server-side features:
  - **Helmet** for CSP & security.  
  - **Compression** for performance.  
  - **Structured logging** with Pino.  
  - **Background jobs** using cron scheduler.  
  - **API caching** with apicache.  
  - **Health checks + graceful shutdown**.  
- Endpoints:
  - `/api/health` → server status.  
  - `/api/report` → cron-built report.  
  - `/api/heavy` → cached heavy compute.  
  - `/api/enqueue + /api/job/:id` → async job queue.

---

## 🔑 Internship Learning Outcomes
Through these 8 tasks, I gained hands-on expertise in:

- **Front-end development**: HTML, CSS, JavaScript, SPA concepts.  
- **Back-end APIs**: Express.js, RESTful design, middleware.  
- **Database integration**: Sequelize ORM, SQLite.  
- **Authentication & Security**: JWT, Passport OAuth, Helmet, rate limiting.  
- **External APIs**: GitHub API, OAuth2 workflows.  
- **Performance & Scalability**: Caching, job queues, logging, graceful shutdown.

---

## 🛠️ How to Run

Each task can be run independently:

```bash
cd task0X_name
npm install
npm run dev    # or npm start
Then visit the localhost port defined for that task.

🌟 About the Program

The Cognifyz Internship Program — Full Stack Development provided a structured, practical learning path.
I built end-to-end applications that evolved from simple SSR to advanced, production-ready systems.

What makes this special is that I completed all 8 tasks in just 6 hours, showcasing focus, speed, and adaptability as a developer.
