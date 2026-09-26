# InterviewGen

An AI-powered interview preparation platform. Upload a resume, add a
self-description and a target job description, and get a full interview report
back — a match score, skill gaps, technical and behavioral questions, and a
learning roadmap — with a local fallback if the AI quota runs out.

![CI](https://github.com/thakur-027/interview-ai/actions/workflows/ci.yml/badge.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_API-@google/genai-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Sass](https://img.shields.io/badge/Sass-SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![Puppeteer](https://img.shields.io/badge/Puppeteer-PDF-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white)

**Live demo:** [interview-ai-zeta-eight.vercel.app](https://interview-ai-zeta-eight.vercel.app)

---

## Table of contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [API reference](#api-reference)
- [Local setup](#local-setup)
- [Running with Docker](#running-with-docker)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Environment variables](#environment-variables)
- [Security](#security)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

The app has two independent services:

- **`backend/`** — Express REST API. Handles auth (JWT in an HTTP-only
  cookie), resume upload (`multer`), interview report generation via Gemini,
  MongoDB persistence, and PDF generation, with a local fallback when the AI
  quota is exhausted or the API is briefly unavailable.
- **`frontend/`** — React + Vite SPA. Login/register, resume upload flow, and
  interview report views, styled with SCSS.

### Features

- **Auth** — email/password register and login, session kept in an HTTP-only
  JWT cookie; logout blacklists the token server-side.
- **Report input** — paste a job description, upload a resume (PDF/DOCX, up to
  10MB), and optionally add self-description context. Recent interview plans
  are listed on the same screen, scoped to the logged-in user.
- **Interview report** — for each generated report:
  - A **match score** (0–100%) rating fit against the job description.
  - A **skill gaps** list highlighting missing or weak areas relative to the
    role.
  - Tabs for **technical questions**, **behavioral questions**, and a
    **roadmap** to close the gaps, each question expandable via
    "Show details."
  - A **download resume** action that generates a tailored PDF via Puppeteer.
- **Resilient AI calls** — automatic retry on transient Gemini errors, model
  fallback if the primary model is unavailable, and a fully local report/PDF
  generator as a last resort so the app never hard-fails on an AI outage.

## Tech stack

- Frontend: React 19, Vite, React Router, Axios, Sass
- Backend: Node.js 20, Express 5, Mongoose, JWT, bcryptjs, Multer
- AI: `@google/genai` (Gemini), Zod for request validation
- PDF: Puppeteer, `pdf-parse`
- Security: Helmet, `express-rate-limit`, ownership-scoped data access,
  centralized error handling
- Testing: Node's built-in test runner, Supertest, `mongodb-memory-server`
- Infra: Docker + Docker Compose (local multi-service dev), GitHub Actions CI

## Repository structure

```text
.
├── .github/workflows/ci.yml      # CI: backend tests, frontend build, Docker builds
├── docker-compose.yml            # mongo + backend + frontend, one command
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── app.js                # Express app, middleware, route mounting
│   │   ├── config/database.js    # Mongo connection
│   │   ├── controllers/          # auth + interview controllers
│   │   ├── middlewares/          # auth, file upload, validation, rate limiting, errors
│   │   ├── models/                # user, interviewReport, blacklist
│   │   ├── routes/                # auth.routes.js, interview.routes.js
│   │   ├── services/ai.service.js # Gemini integration + local fallback
│   │   └── validations/          # Zod request schemas
│   ├── tests/                    # unit + integration test suite
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/               # login/register, context, hooks
│   │   │   └── interview/          # upload flow, report views
│   │   └── app.routes.jsx
│   └── package.json
└── README.md
```

## API reference

Base path: `/api`

### Auth (`/api/auth`)

- POST `/register`: Register with `username`, `email`, and `password`.
  Public. Rate-limited.
- POST `/login`: Login with `email` and `password`. Public. Rate-limited.
- POST `/logout`: Blacklist the current token and clear the cookie.
  Public.
- GET `/get-me`: Return the current authenticated user. Private.

### Interview (`/api/interview`)

- POST `/`: Generate a report.
  `multipart/form-data`: `resume` (file), `selfDescription`,
  `jobDescription`. Private. Rate-limited.
- GET `/`: List all interview reports for the current user. Private.
- GET `/report/:interviewId`: Get a single report by ID. Private, scoped to
  the requesting user's own reports.
- POST `/resume/pdf/:interviewReportId`: Generate or download a resume PDF
  for a report. Private, scoped to the requesting user's own reports.
  Rate-limited.

## Local setup

**Prerequisites:** Node.js 20+, npm, a MongoDB instance (Atlas or local), and
a Gemini API key.

### Backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and configure your values:

```env
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
GOOGLE_GENAI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.8-flash
```

Install dependencies and start the server:

```bash
npm install
npm run dev
```

Runs on `http://localhost:3000`.

### Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`.

## Running with Docker

The whole stack — MongoDB, backend, and frontend — can also run with a
single command, without installing Node or Mongo locally.

```bash
cp .env.example .env   # at the repo root; fill in JWT_SECRET and GOOGLE_GENAI_API_KEY
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- MongoDB: exposed on `27017` (fresh local data, separate from any Atlas
  database used elsewhere)

The backend image installs a system Chromium for Puppeteer (rather than
Puppeteer's own bundled download), and the frontend is built in a
multi-stage image and served via nginx with SPA routing support.

Stop everything with `docker compose down` (add `-v` to also wipe the local
Mongo volume).

## Testing

```bash
cd backend
npm test
```

Runs on Node's built-in test runner (`node --test`) against an isolated
in-memory MongoDB instance (`mongodb-memory-server`) — no real database or
API keys required. Coverage includes:

- Auth flows (register, login, logout, session validation)
- Ownership-scoped access control on interview reports and resume PDFs
- Request validation schemas
- Rate limiting behavior
- Centralized error handling

## CI/CD

Every push and pull request to `main` runs three GitHub Actions jobs in
parallel (see `.github/workflows/ci.yml`):

- **backend-test** — installs dependencies and runs the full test suite
- **frontend-build** — lints and builds the production frontend bundle
- **docker-build** — builds both Docker images to catch container-level
  breakage

`main` is protected: these checks must pass before a pull request can be
merged. Once merged, Render (backend) and Vercel (frontend) auto-deploy from
`main` as they're already connected to this repository — GitHub Actions
handles verification, the hosts handle deployment.

## Environment variables

**`backend/.env`**

- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret used to sign JWTs.
- `GOOGLE_GENAI_API_KEY`: Gemini API key.
- `GEMINI_MODEL`: Example value `gemini-3.8-flash`.
- `PORT`: Port to listen on; hosts like Render inject this.
- `CLIENT_URL`: Deployed frontend origin, for CORS.
- `NODE_ENV`: `production` in production, used to toggle secure cookie
  flags and logging format.

**`frontend/.env`**

- `VITE_API_URL`: Deployed backend origin, for example
  `https://interview-ai-api.onrender.com`.

**Root `.env`** (Docker Compose only)

- `JWT_SECRET`, `GOOGLE_GENAI_API_KEY`, `GEMINI_MODEL` — same values as
  above, read by `docker-compose.yml`.

## Security

- Passwords hashed with bcrypt; sessions are HTTP-only JWT cookies, never
  exposed to client-side JS.
- Logout blacklists the token server-side, so a copied cookie can't be
  replayed after logout.
- All interview report and resume PDF access is scoped to the requesting
  user — one user can never read or generate another user's data by ID.
- Request bodies validated with Zod (registration, login, report
  generation) before touching the database.
- Rate limiting on auth routes (register/login have independent budgets, so
  one doesn't exhaust the other) and on AI-heavy routes.
- `helmet` for standard security headers; centralized error handling so
  internal errors never leak stack traces to clients.
- Secrets are never committed — `.env` files are git-ignored, `.env.example`
  files document the required shape.

## Deployment

The app is deployed as two independent services, connected directly to this
GitHub repository for automatic deployment on every merge to `main`:

- **Backend** — Render (Node.js web service). Environment variables
  (`MONGO_URI`, `JWT_SECRET`, `GOOGLE_GENAI_API_KEY`, `GEMINI_MODEL`,
  `CLIENT_URL`, `NODE_ENV=production`) are set in the Render dashboard.
- **Frontend** — Vercel (static build). `VITE_API_URL` is set in the Vercel
  project settings to point at the deployed backend.

CI (GitHub Actions) gates what reaches `main`; Render and Vercel handle the
actual deploy once code lands there.

## Troubleshooting

- If Gemini returns a transient error or the model is temporarily
  unavailable, the backend automatically retries, then falls back to an
  alternate model, then to a fully local generator — check the backend logs
  for `Falling back to local...` to confirm which path was taken.
- Make sure `MONGO_URI` is valid and reachable.
- If running via Docker and the backend can't reach Mongo, confirm you're
  using `docker compose up` from the repo root (not running `backend/`
  standalone) — the containers rely on Docker's internal service discovery.

## License

ISC
