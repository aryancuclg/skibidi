# ClubSphere AI Context

Portable project memory for handing work between AI assistants. Read this before
making changes, then verify details against the current source and Git worktree.

Last reviewed: 2026-10-18

## Project at a glance

ClubSphere is a university club and activity management platform. It provides
club governance and membership, event workflows, proposals, attendance,
notifications, role-based access control, audit records, and uploads.

The repository is a full-stack application:

- Backend: Python 3.11+, FastAPI, SQLAlchemy, Pydantic, SQLite for local
  development.
- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4.
- The root `app.py` starts both development servers.

## Where to look

- `app.py` — unified backend/frontend development launcher.
- `backend/app/main.py` — FastAPI application, startup initialization, root
  health endpoint, and versioned API mounting.
- `backend/app/api/v1/router.py` — includes the health, auth, clubs, events,
  proposals, notifications, admin, uploads, and academics
  (`GET /branches`, `GET /branches/{id}`) routers.
- `backend/app/api/v1/` — endpoint implementations.
- `backend/app/core/` — settings, database, security, role/access checks,
  auditing, and storage.
- `backend/app/models/` and `backend/app/schemas/` — persistence models and API
  request/response types.
- `backend/tests/` — backend API and behavior tests; `conftest.py` configures an
  in-memory SQLite test database.
- `frontend/src/` — frontend application and styling.
- `frontend/vite.config.ts` — Vite development configuration and API proxy.
- `docs/` — implementation, deployment, architecture, audit, and API reference
  documents. Treat reports and generated specifications as potentially stale;
  confirm current behavior in source.

## Development commands

Run both development servers from the repository root:

```bash
python app.py --no-browser
```

The launcher defaults to backend `127.0.0.1:8000` and frontend
`localhost:5173`. It runs the backend with reload enabled unless passed
`--no-reload`.

Run backend tests from `backend/`:

```bash
python -m pytest
```

Run frontend checks from `frontend/`:

```bash
npm run build
npm run lint
```

The frontend package currently declares build and lint scripts, but no test
script.

## Configuration and data

- Backend settings are defined in `backend/app/core/config.py` and loaded from
  `.env` in the backend working directory. `app.py` copies
  `backend/.env.example` to `backend/.env` when needed and the example exists.
- The default development database is SQLite (`./clubsphere_dev.db`), relative
  to the backend working directory. On SQLite startup, the app creates missing
  tables and seeds baseline roles plus the academic structure
  (`backend/app/core/academic_seed.py` reads `backend/app/data/branches.json`
  and `programs.json` — 22 branches, 59 programs — so course lists can change
  without code edits).
- `backend/scripts/seed_demo.py` (run from `backend/`) seeds demo content on
  top of that: one account per role plus extra students (all share password
  `password123`), 7 clubs across different programs, 6 events with
  registrations/attendance, and 4 proposals covering every workflow state
  (submitted / changes_requested / approved-with-created-club / rejected).
  It is safe to re-run; it exits early if demo users already exist.
- Tests use a separate in-memory SQLite database; avoid assuming the local
  development database contains test data.
- Upload configuration supports local storage and optional Azure Blob Storage.
- Never commit credentials or production secrets. The source default JWT key
  is explicitly for development only; configure a strong secret outside source
  control for deployed environments.

## Working agreements for an incoming AI

1. Read this file, then check `git status` before editing. Preserve existing
   user changes, including untracked files.
2. Treat this document as a navigation aid, not authority over the current
   source. Confirm relevant implementation, tests, and configuration before
   changing behavior.
3. Follow existing API, schema, model, and test patterns. Keep changes focused
   and run the smallest relevant checks; report commands and outcomes.
4. Update the handoff section below when there is meaningful in-progress work,
   a non-obvious design decision, or a known validation gap. Do not record
   credentials, private data, or transient speculation.

## Handoff state

### Session: cinematic scroll-driven homepage (scroll-site-generator skill)

- **What was added:** a public cinematic landing page at `/`
  (`frontend/src/pages/LandingPage.tsx`) — a scroll-driven, live-rendered
  WebGL3D film (Three.js) plus a full brand page below it (manifesto, origin,
  three craft chapters, numbers, specifications, voices, gallery, closing CTA,
  sticky nav, footer).
  - `frontend/src/components/scrollfilm/scene.ts` — the Three.js scene. All
    state is a pure function of scroll progress p ∈ [0,1]; the chapter table is
    documented at the top of the file.
  - `frontend/src/components/scrollfilm/ScrollFilm.tsx` — React port of the
    skill's scrubber engine: 760vh sticky track, time-lerp (1 − exp(−dt·14)),
    caption system with in/hold/out fractions (kept valid for a frame-film).
  - `frontend/src/components/scrollfilm/useReveal.ts` — IntersectionObserver
    reveals plus a scroll sweep so anchor jumps cannot leave sections hidden.
  - `frontend/public/film/*.webp` — 7 stills captured from the live scene at
    caption-free scroll windows (source PNGs in the git-ignored
    `.scrollfilm/assets/`).
  - `App.tsx` — `LandingPage` is `React.lazy`-loaded so three.js stays out of
    the app bundle (~148 KB gz chunk, loaded only on `/`). `/clubs` etc. keep
    RequireAuth behaviour; the catch-all still lands on `/`. `LoginPage` gained
    a "← ClubSphere home" link.
- **Why not AI film frames:** the skill's Higgsfield/Kling pipeline needs a real
  `HF_KEY`; the skill's `.env` only contains a placeholder. The engine is
  structured so an AI frame sequence can replace the WebGL layer behind the same
  track/caption contract. To switch: put a real key in
  `~/.config/opencode/skills/scroll-site-generator/.env`, then use the
  Windows-safe runner `.scrollfilm/tools/gen.py` (image/video/upload).
- **Verification (this session):** `npm run build` ✓; `npm run lint` ✓
  (0 warnings); headless-Chromium probes (`.scrollfilm/tools/qc/`) show
  **0 console/page errors** desktop + mobile, header hidden at scroll 0 and
  visible after the film, captions present at every chapter, 26/26 reveals fire,
  all 7 stills load, and `/`, `/login`, `/clubs`, `/events`, `/applyclub`, and an
  unknown route all behave. Fixed during QC: NaN starfield positions
  (`shellPoints(1, …)` divided by zero) and reveals skipped by instant jumps.
- **Environment note:** ffmpeg 9.0.2 was installed via winget for the skill
  pipeline. Run the app as before with `python app.py`; the film is at `/`.

Last updated: 2026-10-18 (end of session)

- **Goal / requested behavior:**
  All requested work is complete and verified live:
  1. **Multi-page UI with real URLs** — `/`, `/login`, `/clubs` ("CLUBS"),
     `/events` ("Events"), `/joinclub` ("Join club"), `/applyclub` ("Apply for
     club"), `/admin`. React Router (`react-router-dom`) with `RequireAuth`
     preserving the destination via `location.state.from`.
  2. **Admin dashboard** (`AdminDashboardPage`) — headline stats, branch
     breakdown table, audit trail. Uses `GET /admin/analytics/overview`
     (Administrator + HOD) and `GET /admin/audit-logs` (Administrator only).
  3. **Department → Branch/Program refactor** — the old `Department` model was
     fully replaced. `Branch` (22, e.g. B.Tech) is the parent of `Program`
     (59, e.g. B.Tech CSE with AI & ML, some with a `collaboration_partner`).
     `User`, `Club`, and `ClubProposal` now point at `ProgramId` (nullable on
     User), which carries its Branch. Public `GET /api/v1/branches` returns
     branches with nested programs for the dropdowns.
  4. **Cascading Branch → Program dropdowns** — `ProgramSelector.tsx` is used
     in the registration form (`LoginPage`), the Apply-for-club form
     (`ApplyClubPage`), and the ClubsPage filter (sends `program_id`, or
     `branch_id` when only a branch is chosen).

- **Important decisions and constraints:**
  - Dev port is **5173** in both `frontend/vite.config.ts` and
    `backend/app/core/config.py` (`CORS_ORIGINS`); the Vite proxy forwards
    `/api` to `127.0.0.1:8000`.
  - Analytics renamed `department_metrics` → `branch_metrics`
    (`BranchMetricItem`); `department_metrics` is kept as a backwards-compat
    alias in the response.
  - Approval workflow unchanged: Faculty recommends → HOD final approval
    auto-creates the club and assigns the applicant Manager/Lead. RBAC via
    `require_roles()` (admin has a global override).
  - Root `app.py` shadows the `app` package — always run backend commands
    (`pytest`, scripts) from `backend/`. PowerShell: use `;`, not `&&`.
  - SQLite stores naive datetimes; the events router normalizes `tzinfo`
    before comparisons, so seed with naive UTC datetimes.

- **Validation run and results (this session):**
  - `python -m pytest` (from `backend/`) — **52 passed**.
  - `npm run build` — clean; `npm run lint` — 0 warnings.
  - Live via launcher + Vite proxy: `/health` 200; `GET /api/v1/branches` 200
    (22 branches / 59 programs; B.Tech has 14 programs incl. AI/ML with
    Microsoft); all five role logins succeed with `password123`; admin
    analytics 200 with 22 branch metrics; Student gets **403** on analytics
    (RBAC verified); events/proposals/notifications scoped correctly per role;
    all 7 frontend routes return 200 on deep link.
  - Dev DB was recreated (`backend/clubsphere_dev.db`) because the old schema
    (Departments) is incompatible with the ProgramId FKs. Old DBs were backed
    up as `clubsphere_dev.db.bak_<timestamp>` (root and backend).

- **Remaining work / next step:**
  1. Known gap (carried over): no student-facing "my registrations" endpoint
     (`GET /events/{id}/registrations` is manager/admin only), so the Events
     page can only cancel registrations made in the current session. A small
     `/api/v1/me/registrations` endpoint would fix this.
  2. Nearly the whole codebase is still **uncommitted** in git (all changes
     from both sessions) — consider an initial commit.
  3. Optional: the demo seed lives at `backend/scripts/seed_demo.py`; delete
     `backend/clubsphere_dev.db` and re-run it for a clean demo anytime.
