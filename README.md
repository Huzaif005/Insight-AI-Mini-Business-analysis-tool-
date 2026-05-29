# InsightAI

InsightAI is a mini business analysis tool with a React frontend and a Python Flask backend. It supports dataset uploads, automated data analysis, AI-generated insights, charts, and reporting.

## Project Structure

- `frontend/` — React + Vite frontend application
- `backend/` — Python Flask backend API
- `datasets/` — Sample CSV datasets for testing
- `docs/` — Project documentation and assets
- `screenshots/` — UI screenshots and presentation assets

## Features

- Upload datasets from the frontend
- Backend file handling and basic analytics
- AI-style insight generation
- Dashboard with charts, KPI cards, and chat assistant UI
- Report listing endpoint

## Setup

### Frontend

```bash
cd "C:\Users\Huzaif\OneDrive\Desktop\byte me\InsightAI\frontend"
npm install
npm run dev
```

The frontend runs on `http://localhost:3001/` if port `3000` is occupied.

### Backend

```bash
cd "C:\Users\Huzaif\OneDrive\Desktop\byte me\InsightAI\backend"
python -m pip install -r requirements.txt
python app.py
```

The backend runs on `http://localhost:8000`.

## API Endpoints

- `GET /health` — health check
- `POST /api/upload/` — upload dataset files
- `GET /api/analysis/charts` — get chart metadata
- `POST /api/predictions/` — run prediction requests
- `GET /api/insights/` — fetch generated insights
- `GET /api/reports/` — list generated reports

## Notes

- The frontend uses Vite with React and Tailwind CSS.
- The backend is a starter Flask app with placeholder services.
- Add actual model files under `backend/models/` and expand business logic in `backend/services/`

## Website link of local host 
http://localhost:3000/

