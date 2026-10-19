# ClubSphere — University Club & Activity Lifecycle Management Platform

ClubSphere is a centralized platform designed to streamline student organization governance, multi-tier event approval workflows, role-based access control, attendance tracking, and compliance audits for universities.

---

## ⚡ Quick Start — Running the Entire System

To start **both** the backend and frontend simultaneously with a single command:

```bash
python app.py
```

This single entry point handles:
1. **Prerequisite Verification**: Checks Python environment, initializes `backend/.env` from `.env.example`, and ensures `node_modules` are installed.
2. **FastAPI Backend**: Runs on `http://127.0.0.1:8000` with code hot-reloading.
3. **React Vite Frontend**: Runs on `http://localhost:5173` with HMR (Hot Module Replacement) and proxy configuration.
4. **Log Multiplexing**: Streams labeled logs (`[BACKEND]` and `[FRONTEND]`) to your terminal.
5. **Clean Process Lifecycle**: Press `Ctrl + C` at any time to gracefully terminate all servers.

### CLI Options

```bash
# Run without opening the browser automatically
python app.py --no-browser

# Custom ports
python app.py --backend-port 8000 --frontend-port 5173

# Disable auto-reload
python app.py --no-reload
```

---

## 🌐 Endpoints & URLs

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | React 19 + Tailwind v4 + Vite dashboard |
| **Backend REST API** | [http://127.0.0.1:8000](http://127.0.0.1:8000) | FastAPI REST service |
| **Interactive API Docs** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Swagger UI interactive test documentation |
| **Alternative Docs** | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | ReDoc specifications |
| **Health Check API** | [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) | System & database connectivity health smoke test |

---

## 📁 Project Architecture

```
ClubSphere_Project/
├── app.py                   # 🌟 Unified single-command launcher for whole system
├── backend/                 # FastAPI REST API Backend
│   ├── app/
│   │   ├── api/v1/          # Modular API routers (auth, clubs, events, approvals, etc.)
│   │   ├── core/            # Config, database engine, security JWT & rate-limiting
│   │   ├── models/          # SQLAlchemy ORM models
│   │   └── schemas/         # Pydantic request/response schemas
│   ├── tests/               # 52 Automated unit & integration tests
│   ├── clubsphere_dev.db    # SQLite dev database (seeded with roles & departments)
│   └── requirements.txt     # Python backend dependencies
├── frontend/                # React 19 Frontend
│   ├── src/                 # Modern UI components & styling
│   ├── vite.config.ts       # Vite configuration with /api and /health reverse proxy
│   └── package.json         # Node.js dependencies
└── docs/                    # OpenAPI specifications and architectural reports
```
