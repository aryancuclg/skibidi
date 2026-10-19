# ClubSphere — Deployment & Operational Readiness Guide

**Document Version:** 1.0.0  
**Target Environments:** Local Development, Docker Containers, Azure Cloud (App Service / Container Apps + Azure SQL + Azure Blob Storage)

---

## 1. Local Development Setup

### 1.1 Prerequisites
- Python 3.11, 3.12, or 3.15 installed
- Node.js 20+ (LTS) & npm 10+ installed
- Git installed

### 1.2 Unified Single-Command Launch
The simplest way to run both backend and frontend locally:
```bash
python app.py
```
This automatically initializes `backend/.env`, installs frontend `node_modules` if missing, starts the FastAPI backend on `http://127.0.0.1:8000`, starts the Vite frontend on `http://localhost:5173`, and proxies requests.

### 1.3 Individual Manual Startup
#### Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
#### Frontend:
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

---

## 2. Environment Configuration Reference

Configuration is managed via `backend/.env` (modeled by `app/core/config.py`):

| Variable | Default Value (Development) | Production Requirement |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `development` | Set to `production` |
| `DEBUG` | `true` | Set to `false` in production |
| `DATABASE_URL` | `sqlite:///./clubsphere_dev.db` | `mssql+pyodbc://user:pass@host/db?driver=ODBC+Driver+18+for+SQL+Server` |
| `JWT_SECRET_KEY` | *(dev temporary key)* | **Mandatory:** Generate via `openssl rand -hex 32` |
| `JWT_ALGORITHM` | `HS256` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | `7` |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Whitelist specific production frontend domain(s) |
| `AZURE_STORAGE_CONNECTION_STRING` | `""` *(uses local ./uploads)* | Azure Storage Account connection string |
| `AZURE_STORAGE_CONTAINER_NAME` | `clubsphere-uploads` | Container name in Azure Blob Storage |
| `MAX_UPLOAD_SIZE_BYTES` | `10485760` (10 MB) | Max file upload limit |

---

## 3. Docker Container Deployment

### 3.1 Multi-Container Local Deployment
```bash
docker compose up --build -d
```
Inspect logs:
```bash
docker compose logs -f backend
```
Verify container health:
```bash
curl http://localhost:8000/health
```

### 3.2 Production Container Build
```bash
docker build -t clubsphere-backend:latest -f backend/Dockerfile backend/
```

---

## 4. Production Database Deployment (Azure SQL)

1. **Schema DDL**: Execute `backend/sql/azure_sql_schema.sql` on the Azure SQL instance to provision tables, indexes, and constraints.
2. **Power BI Views**: Deploy `backend/sql/power_bi_views.sql` to expose institutional reporting views.
3. **Connection String Format**:
   ```env
   DATABASE_URL=mssql+pyodbc://clubsphere_admin:<PASSWORD>@clubsphere-sql.database.windows.net/clubspheredb?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes&TrustServerCertificate=no
   ```

---

## 5. Automated Verification & Testing

Before deploying, run all test suites:

```bash
# Run backend pytest suite
cd backend
pytest -v

# Run frontend typecheck and production bundle build
cd ../frontend
npx tsc -b
npm run build
```

---

## 6. Operational Monitoring & Health Checks

- **Health Check Probe:** `GET /health` and `GET /api/v1/health`
  - Validates application responsiveness and database connectivity (`SELECT 1`).
  - Returns `200 OK` with JSON: `{"status": "healthy", "database": "connected"}`.
  - Returns `503 Service Unavailable` if database is unreachable.
- **Audit Logging:** Query `GET /api/v1/admin/audit-logs` (requires `Administrator` role) to inspect operational changes.
