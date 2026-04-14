# WeatherOrNot

WeatherOrNot is a full-stack weather dashboard built with Flask, SQLAlchemy, SQLite, React, and Vite.

It provides:
- Current weather by city
- 7-day forecast
- Saved locations
- Weather history from stored records

## What It Uses To Pull Weather Data

The backend weather service uses two external providers:

1. WeatherAPI (primary)
- Used when WEATHER_API_KEY is set in your environment.

2. Open-Meteo (fallback)
- Used automatically when WEATHER_API_KEY is missing.
- No API key required.

This logic lives in backend/src/services/weather_api.py.

## Current Architecture

- Frontend: React + Vite
- Backend: Flask REST API
- Database: SQLite
- ORM: SQLAlchemy
- HTTP: requests (backend), fetch (frontend)

Data flow:
- React calls Flask endpoints under /api
- Flask fetches from WeatherAPI or Open-Meteo
- Flask persists weather and forecast records in SQLite
- Flask returns normalized JSON to the frontend

## Project Structure

```text
WeatherOrNot/
├── backend/
│   ├── app.py
│   └── src/
│       ├── config/
│       │   ├── constants.py
│       │   └── database.py
│       ├── models/
│       │   ├── saved_location.py
│       │   └── weather_record.py
│       └── services/
│           └── weather_api.py
├── frontend/
│   ├── .env.example
│   └── src/
│       ├── hooks/
│       │   └── useWeather.js
│       └── panels/
│           ├── WeatherPanel.jsx
│           ├── ForecastPanel.jsx
│           ├── LocationsPanel.jsx
│           └── ToDoPanel.jsx
├── .env.example
├── requirements.txt
└── README.md
```

## Environment Files

Root backend env template: .env.example

Frontend env template: frontend/.env.example

### Backend variables (root .env)

```env
WEATHER_API_KEY=your_api_key_here
SQLITE_DB_PATH=weather_app.db
FLASK_ENV=development
FLASK_DEBUG=True
# Optional
# CORS_ORIGINS=http://localhost:5173
```

### Frontend variables (frontend/.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The frontend defaults to http://localhost:5000/api if VITE_API_BASE_URL is not set.

## Quick Start

## 1) Backend

From project root:

```bash
python -m venv venv
```

Activate virtual environment:

Windows PowerShell:

```bash
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your root .env from .env.example, then run:

```bash
python backend/app.py
```

Backend runs at http://localhost:5000.

## 2) Frontend

In a new terminal:

```bash
cd frontend
npm install
```

Create frontend .env from frontend/.env.example, then run:

```bash
npm run dev
```

Frontend runs at http://localhost:5173 by default.

## API Endpoints

- GET /api/health
- GET /api/weather/<city_name>
- GET /api/forecast/<city_name>
- GET /api/weather-history/<city_name>?hours=24
- GET /api/forecast-history/<city_name>
- GET /api/saved-locations
- POST /api/saved-locations
- DELETE /api/saved-locations/<location_id>

## Notes

- SQLite is the only supported database in this project.
- Runtime DB files and local env files are ignored by git.
- If your dev server port is busy, stop old Node processes and rerun npm run dev.

## Team

- Alvaro Gonzalez
- Ben Johnson-Gomez