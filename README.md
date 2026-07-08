# InterviewGen

An AI-powered interview preparation platform. Upload a resume, add a self-description and a target job description, and get a full interview report back — a match score, skill gaps, technical and behavioral questions, and a learning roadmap — with a PDF resume fallback if the AI quota runs out.

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Gemini_API-@google/genai-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Sass-SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white" alt="Sass" />
  <img src="https://img.shields.io/badge/Axios-HTTP-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" />
  <img src="https://img.shields.io/badge/Puppeteer-PDF-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white" alt="Puppeteer" />
</p>

---

## Table of contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [API reference](#api-reference)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
- [Known issues & pre-deploy checklist](#known-issues--pre-deploy-checklist)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

The app has two independent services:

- **`backend/`** — Express REST API. Handles auth (JWT in an HTTP-only cookie), resume upload (`multer`), interview report generation via Gemini, MongoDB persistence, and PDF generation as a fallback when the AI quota is exhausted.
- **`frontend/`** — React + Vite SPA. Login/register, resume upload flow, and interview report views, styled with SCSS.

### Features

- **Auth** — email/password register and login, session kept in an HTTP-only JWT cookie.
- **Report input** — paste a job description, upload a resume (PDF/DOCX, up to 10MB), and optionally add self-description context. Recent interview plans are listed on the same screen.
- **Interview report** — for each generated report:
  - A **match score** (0–100%) rating fit against the job description.
  - A **skill gaps** list highlighting missing or weak areas relative to the role.
  - Tabs for **technical questions**, **behavioral questions**, and a **roadmap** to close the gaps, each question expandable via "Show details."
  - A **download resume** action that generates a tailored PDF via Puppeteer.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, React Router, Axios, Sass |
| Backend | Node.js, Express 5, Mongoose, JWT, bcryptjs, Multer |
| AI | `@google/genai` (Gemini), Zod for schema validation |
| PDF | Puppeteer, `pdf-parse` |
| Auth | JWT stored in an HTTP-only cookie, with a token-blacklist collection for logout |

## Repository structure

```
.
├── backend/
│   ├── src/
│   │   ├── app.js                # Express app, middleware, route mounting
│   │   ├── config/database.js    # Mongo connection
│   │   ├── controllers/          # auth + interview controllers
│   │   ├── middlewares/          # auth + file upload middleware
│   │   ├── models/                # user, interviewReport, blacklist
│   │   ├── routes/                # auth.routes.js, interview.routes.js
│   │   └── services/ai.service.js # Gemini integration
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
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

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register with `username`, `email`, `password` | Public |
| POST | `/login` | Login with `email`, `password` | Public |
| POST | `/logout` | Blacklists the current token, clears the cookie | Public |
| GET | `/get-me` | Returns the current authenticated user | Private |

### Interview (`/api/interview`)

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/` | Generate a report. `multipart/form-data`: `resume` (file), `selfDescription`, `jobDescription` | Private |
| GET | `/` | List all interview reports for the current user | Private |
| GET | `/report/:interviewId` | Get a single report by ID | Private |
| POST | `/resume/pdf/:interviewReportId` | Generate/download a resume PDF for a report (fallback path) | Private |

## Local setup

**Prerequisites:** Node.js 18+, npm, a MongoDB instance (Atlas or local), a Gemini API key.

### Backend

```bash
cd backend
cp .env.example .env
# fill in .env — see Environment variables below
npm install
npm run dev
```

Runs on `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`.

## Environment variables

**`backend/.env`**

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `GOOGLE_GENAI_API_KEY` | Gemini API key |
| `GEMINI_MODEL` | e.g. `gemini-2.0-flash` |
| `PORT` | *(add this — see below)* Port to listen on; hosts like Render inject this |
| `CLIENT_URL` | *(add this)* Deployed frontend origin, for CORS |
| `NODE_ENV` | `production` in prod — used to toggle secure cookie flags |

**`frontend/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | *(add this)* Deployed backend origin, e.g. `https://interview-ai-api.onrender.com` |

## Deployment

The frontend and backend deploy as two separate services.

### 1. Backend → Render

1. Push your latest code to GitHub.
2. In Render: **New → Web Service**, connect the repo, set the **root directory** to `backend`.
3. Build command: `npm install` · Start command: `npm start` (see checklist below — you need to add this script).
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `GOOGLE_GENAI_API_KEY`, `GEMINI_MODEL`, `CLIENT_URL` (your Vercel URL, added after step 2), `NODE_ENV=production`.
5. Deploy. Render assigns the port via `process.env.PORT` — make sure `server.js` reads it (see checklist).

Puppeteer needs a real Chromium install and enough memory to launch it — Render's free instance can be slow or run out of memory on first PDF generation. If you hit crashes there, move to a paid instance or swap in `@sparticuz/chromium` for a lighter headless build.

### 2. Frontend → Vercel

1. In Vercel: **New Project**, import the repo, set **root directory** to `frontend`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Add environment variable `VITE_API_URL` = your Render backend URL.
4. Deploy. Then go back to Render and set `CLIENT_URL` to this Vercel URL.

### Single-host alternative

You can serve the built frontend from the Express backend instead of two hosts — build the frontend, copy `frontend/dist` into `backend/public`, and add `express.static` + a catch-all route in `app.js`. Simpler to host, but you lose Vercel's CDN/edge caching for the frontend.

## Known issues & pre-deploy checklist

These are real blockers for a working production deployment, found by reading the current source — worth fixing before you deploy:

- [ ] **Backend port is hardcoded.** `server.js` calls `app.listen(3000, ...)`. Render (and most hosts) inject the port via `process.env.PORT`. Change to:
  ```js
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  ```
- [ ] **No `start` script.** `backend/package.json` only has `dev` (nodemon). Add:
  ```json
  "scripts": {
    "start": "node server.js",
    "dev": "npx nodemon server.js"
  }
  ```
- [ ] **CORS origin is hardcoded to `localhost:5173`** in `backend/src/app.js`. It will reject requests from your deployed frontend. Use an env var:
  ```js
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }));
  ```
- [ ] **Auth cookie has no `sameSite`/`secure` flags.** `res.cookie('token', token)` in `auth.controller.js` will silently fail to be sent cross-site once frontend and backend are on different domains (Vercel vs Render). Browsers require `SameSite=None; Secure` for cross-site cookies:
  ```js
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
  });
  ```
  Apply the same options object to `res.clearCookie('token', {...})` in the logout controller so it actually clears in production.
- [ ] **Frontend API base URL is hardcoded** to `http://localhost:3000` in both `auth.api.js` and `interview.api.js`. Switch to an env var so the deployed build points at your live backend:
  ```js
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true
  });
  ```
- [ ] **`node_modules/` and a stray root `package.json`/`package-lock.json` are committed** at the repo root, even though `.gitignore` excludes `node_modules/`. This looks like leftover setup from before the backend/frontend split. Clean it up:
  ```bash
  git rm -r --cached node_modules package-lock.json package.json
  git commit -m "Remove stray root-level files"
  ```

## Troubleshooting

- **AI quota exhausted:** the backend falls back to a local PDF resume generator — check your Gemini key/project quota if reports stop generating.
- **`MONGO_URI` errors:** confirm the connection string and that your Render service's outbound IP is allow-listed in Atlas (or use "allow from anywhere" for testing).
- **Login works locally but not in production:** almost always the cookie `sameSite`/`secure` issue above, or `CLIENT_URL`/`VITE_API_URL` not set correctly.
- **PDF generation times out or crashes on Render:** usually Puppeteer running out of memory on a free instance.

## License

MIT
