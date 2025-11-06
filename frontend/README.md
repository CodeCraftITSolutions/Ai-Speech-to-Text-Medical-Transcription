# MedTranscribe Frontend

This React + Vite application provides the user interface for the MedTranscribe platform. It connects to the FastAPI backend for authentication, job management, and audio uploads.

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

The app expects the backend to be running (default: `http://localhost:8000`). Configure the API base URL via a Vite environment variable:

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000
```

Restart the dev server whenever you change environment variables.

## Available Scripts

- `npm run dev` – start the development server with hot reloading.
- `npm run build` – create a production build.
- `npm run preview` – preview the production build locally.

## Authentication Flow

- Registration and login flows exchange credentials with the backend and store a JWT access token in `localStorage`.
- Protected dashboard routes require a valid session; unauthenticated users are redirected to `/login`.
- Session details are fetched from `/v1/auth/me` to populate the UI.

## Transcription Workflow

- Upload audio files from the **New Transcription** page. Files are posted to `/v1/transcribe/upload` and automatically create a job via `/v1/jobs`.
- Monitor processing status from the **History** page, which lists jobs returned by `/v1/jobs`.

Ensure CORS on the backend allows the origin used by the frontend (`FRONTEND_ORIGIN` in backend settings).
