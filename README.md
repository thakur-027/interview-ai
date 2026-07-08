# Interview AI

A full-stack interview preparation application with resume-based AI interview analysis and PDF resume generation.

## Overview

This repository contains two main parts:

- `backend/`: Express API server with authentication, MongoDB persistence, Gemini AI integration, and PDF generation.
- `frontend/`: React + Vite UI for login, upload resume, and request interview reports.

## Features

- User registration and login
- Upload a resume PDF and provide self-description/job description
- Generate interview reports using AI
- Store interview reports per user
- Download a generated resume PDF fallback when AI quota is unavailable

## Repository structure

```text
.
├── backend/
│   ├── src/
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 18+ installed
- npm installed
- MongoDB instance (Atlas or local)
- Gemini API key for Google GenAI

## Backend setup

1. Copy the example environment file:

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

The backend runs on `http://localhost:3000` by default.

## Frontend setup

1. Install dependencies:

    ```bash
    cd ../frontend
    npm install
    ```

1. Start the frontend development server:

    ```bash
    npm run dev
    ```

The frontend runs on `http://localhost:5173` by default.

## Usage

- Register a new user
- Login
- Upload a resume PDF and add self-description / job description
- Generate an interview report
- Download the resume PDF for the selected report

## Production build

To build the frontend for production:

```bash
cd frontend
npm run build
```

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

> If your host requires a `start` script, add one in `backend/package.json`:
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

If you want a single domain in production, update the frontend API base URL to the deployed backend host or use an environment variable.

### Single-host option

You can also serve the frontend from the backend by copying the `dist/` folder into the backend and adding a static middleware route, but that requires a small backend change.

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

- If the AI quota is exhausted, the backend will fall back to a local PDF resume generator.
- Check your Gemini API key and project quota.
- Make sure `MONGO_URI` is valid and reachable.
