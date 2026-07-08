# InterviewGen

An AI-powered interview preparation platform. Upload a resume, add a
self-description and a target job description, and get a full interview report
back — a match score, skill gaps, technical and behavioral questions, and a
learning roadmap — with a PDF resume fallback if the AI quota runs out.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_API-@google/genai-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Sass](https://img.shields.io/badge/Sass-SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Puppeteer](https://img.shields.io/badge/Puppeteer-PDF-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white)

---

## Table of contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [API reference](#api-reference)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
- [Known issues and pre-deploy checklist](#known-issues-and-pre-deploy-checklist)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

The app has two independent services:

- **`backend/`** — Express REST API. Handles auth (JWT in an HTTP-only
  cookie), resume upload (`multer`), interview report generation via Gemini,
  MongoDB persistence, and PDF generation as a fallback when the AI quota is
  exhausted.
- **`frontend/`** — React + Vite SPA. Login/register, resume upload flow, and
  interview report views, styled with SCSS.

### Features

- **Auth** — email/password register and login, session kept in an HTTP-only
  JWT cookie.
- **Report input** — paste a job description, upload a resume (PDF/DOCX, up to
  10MB), and optionally add self-description context. Recent interview plans
  are listed on the same screen.
- **Interview report** — for each generated report:
  - A **match score** (0–100%) rating fit against the job description.
  - A **skill gaps** list highlighting missing or weak areas relative to the
    role.
  - Tabs for **technical questions**, **behavioral questions**, and a
    **roadmap** to close the gaps, each question expandable via
    "Show details."
  - A **download resume** action that generates a tailored PDF via Puppeteer.

## Tech stack

- Frontend: React 19, Vite, React Router, Axios, Sass
- Backend: Node.js, Express 5, Mongoose, JWT, bcryptjs, Multer
- AI: `@google/genai` (Gemini), Zod for schema validation
- PDF: Puppeteer, `pdf-parse`
- Auth: JWT stored in an HTTP-only cookie, with a token-blacklist
  collection for logout

## Repository structure

```text
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

- POST `/register`: Register with `username`, `email`, and `password`.
  Public.
- POST `/login`: Login with `email` and `password`. Public.
- POST `/logout`: Blacklist the current token and clear the cookie.
  Public.
- GET `/get-me`: Return the current authenticated user. Private.

### Interview (`/api/interview`)

- POST `/`: Generate a report.
  `multipart/form-data`: `resume` (file), `selfDescription`,
  `jobDescription`. Private.
- GET `/`: List all interview reports for the current user. Private.
- GET `/report/:interviewId`: Get a single report by ID. Private.
- POST `/resume/pdf/:interviewReportId`: Generate or download a resume PDF
  for a report. Private.

## Local setup

**Prerequisites:** Node.js 18+, npm, a MongoDB instance (Atlas or local), and
a Gemini API key.

### Backend

1. Change into the backend directory:

```bash
cd backend
cp .env.example .env
```

1. Open `backend/.env` and configure your values:

```env
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
GOOGLE_GENAI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
```

1. Install dependencies:

```bash
npm install
```

1. Start the backend server:

```bash
npm run dev
```

Runs on `http://localhost:3000`.

### Frontend

1. Change into the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

1. Start the frontend development server:

```bash
npm run dev
```

Runs on `http://localhost:5173`.

## Environment variables

**`backend/.env`**

- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret used to sign JWTs.
- `GOOGLE_GENAI_API_KEY`: Gemini API key.
- `GEMINI_MODEL`: Example value `gemini-2.0-flash`.
- `PORT`: Port to listen on; hosts like Render inject this.
- `CLIENT_URL`: Deployed frontend origin, for CORS.
- `NODE_ENV`: `production` in production, used to toggle secure cookie
  flags.

**`frontend/.env`**

- `VITE_API_URL`: Deployed backend origin, for example
  `https://interview-ai-api.onrender.com`.

## Deployment

### Recommended approach

Because this app is split into frontend and backend services, deploy them separately:

#### Backend deployment

Use any Node.js host such as Render, Railway, Heroku, or Azure App Service.

1. Push the backend code to a GitHub repo.
1. Create a new Node.js service in your host.
1. Set environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GOOGLE_GENAI_API_KEY`
   - `GEMINI_MODEL`
1. Use `npm install` and `npm run dev` or a production start command.

> If your host requires a `start` script, add one in
> `backend/package.json`:
>
> ```json
> "scripts": {
>   "start": "node server.js",
>   "dev": "npx nodemon server.js"
> }
> ```

#### Frontend deployment

Use Vercel, Netlify, or any static host.

1. Build the frontend: `npm run build`
1. Deploy the `dist/` output folder.
1. Make sure the frontend uses the backend API URL.

If you want a single domain in production, update the frontend API base
URL to the deployed backend host or use an environment variable.

### Single-host option

You can also serve the frontend from the backend by copying the `dist/`
folder into the backend and adding a static middleware route, but that
requires a small backend change.

## Known issues and pre-deploy checklist

- Gemini free-tier quota may cause the backend to fall back to local PDF
  generation.
- Ensure production environment variables are configured before deployment.
- Verify the frontend API base URL points to the deployed backend host.

## Important security note

Do not commit sensitive values to GitHub.

- `backend/.env` is ignored by Git
- `backend/.env.example` is included as a template

## Helpful commands

```bash
# backend
cd backend
npm install
npm run dev

# frontend
cd frontend
npm install
npm run dev
```

## Troubleshooting

- If the AI quota is exhausted, the backend will fall back to a local PDF
  resume generator.
- Check your Gemini API key and project quota.
- Make sure `MONGO_URI` is valid and reachable.

## License

MIT
