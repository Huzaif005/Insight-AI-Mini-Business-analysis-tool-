# API Documentation

Base URL: `http://localhost:8000`

Endpoints:

- `GET /health` — Health check. Returns `{ "status": "ok" }`.
- `POST /api/upload/` — Upload a file. Form field `file` (multipart/form-data). Returns `filename` and `path`.
- `GET /api/analysis/charts` — Returns chart metadata from `visualization_service`.
- `POST /api/predictions/` — Send JSON payload for prediction. Returns `{ "prediction": ... }`.
- `GET /api/insights/` — Returns generated insights.
- `GET /api/reports/` — Lists available report files.

Examples:

Upload (curl):

```bash
curl -F "file=@/path/to/data.csv" http://localhost:8000/api/upload/
```

Predict (curl):

```bash
curl -X POST -H "Content-Type: application/json" -d '{"features": [1,2,3]}' http://localhost:8000/api/predictions/
```

