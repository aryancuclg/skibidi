# ClubSphere — Baseline Verification & Technical Audit Report

**Date of Audit:** October 18, 2026  
**Environment:** Windows (win32), Python 3.15.0, Node.js v26.7.0, npm 12.2.0  
**Testing Frameworks:** `pytest 9.1.1` (backend), `oxlint 1.81.0` & `tsc 6.0.2` (frontend)  
**Database Tested:** SQLite 3 in-memory (`sqlite:///:memory:`) and local development DB (`backend/clubsphere_dev.db`)

---

## 1. Executive Summary

This report establishes the verified empirical baseline of the **ClubSphere** repository across backend and frontend environments before implementing fixes and architectural enhancements.

| Component | Target Runtime | Command Executed | Result | Notes / Warnings |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Test Suite** | Python 3.15 / FastAPI | `pytest -v` | **52 Passed, 0 Failed** | 1 StarletteDeprecationWarning (`httpx` -> `httpx2`) |
| **Backend Code Import** | FastAPI / Uvicorn | `python -c "from app.main import app..."` | **Clean Exit (0)** | Schema & model initialization verified |
| **Frontend TypeCheck** | TypeScript 6.0 / Vite 8.3 | `npx tsc -b` | **Clean Exit (0)** | Zero type errors |
| **Frontend Production Build** | Rollup / Vite | `npm run build` | **Clean Exit (0)** | Built dist bundle in 144ms |
| **Frontend Linting** | Oxlint 1.81.0 | `npm run lint` | **1 Warning, 0 Errors** | `react(set-state-in-effect)` in `src/App.tsx` |
| **Database DDL / Health** | SQLite 3 | `SELECT 1` & Table query | **Connected (PRAGMA foreign_keys=ON)** | 14 Relational tables mapped |

---

## 2. Backend Baseline Verification

### 2.1 Execution Log
```text
platform win32 -- Python 3.15.0, pytest-9.1.1, pluggy-1.7.0
rootdir: C:\Users\Aryan\Desktop\ClubSphere_Project\backend
plugins: anyio-4.15.1
collected 52 items

tests/test_attendance_outcomes.py::test_attendance_and_outcomes_lifecycle PASSED [  1%]
tests/test_audit_sync.py::test_audit_log_written_synchronously_on_approval PASSED [  3%]
tests/test_audit_sync.py::test_transactional_rollback_if_audit_fails PASSED [  5%]
tests/test_auth.py::test_register_student_success PASSED                 [  7%]
tests/test_auth.py::test_register_duplicate_email_fails PASSED           [  9%]
tests/test_auth.py::test_login_success PASSED                            [ 11%]
tests/test_auth.py::test_login_invalid_password_fails PASSED             [ 13%]
tests/test_auth.py::test_refresh_token_success PASSED                    [ 15%]
tests/test_auth.py::test_refresh_token_invalid_fails PASSED              [ 17%]
tests/test_auth.py::test_auth_me_endpoint PASSED                         [ 19%]
tests/test_auth.py::test_auth_me_unauthorized_fails PASSED               [ 21%]
tests/test_clubs.py::test_list_clubs_public PASSED                       [ 23%]
tests/test_clubs.py::test_get_club_details PASSED                        [ 25%]
tests/test_clubs.py::test_join_club_success PASSED                       [ 26%]
tests/test_clubs.py::test_join_club_duplicate_fails PASSED               [ 28%]
tests/test_clubs.py::test_list_club_members_by_manager PASSED            [ 30%]
tests/test_clubs.py::test_list_club_members_denied_for_unauthorized_student PASSED [ 32%]
tests/test_clubs.py::test_update_membership_status PASSED                [ 34%]
tests/test_clubs.py::test_update_club_profile_by_manager PASSED          [ 36%]
tests/test_clubs.py::test_update_club_profile_denied_for_other_user PASSED [ 38%]
tests/test_events.py::test_create_event_success PASSED                   [ 40%]
tests/test_events.py::test_create_event_deadline_after_event_fails PASSED [ 42%]
tests/test_events.py::test_event_registration_success PASSED             [ 44%]
tests/test_events.py::test_event_registration_duplicate_fails PASSED     [ 46%]
tests/test_events.py::test_event_capacity_exhaustion_fails PASSED        [ 48%]
tests/test_events.py::test_event_past_deadline_rejected PASSED           [ 50%]
tests/test_events.py::test_cancel_registration PASSED                    [ 51%]
tests/test_health.py::test_root_health_check PASSED                      [ 53%]
tests/test_health.py::test_api_v1_health_check PASSED                    [ 55%]
tests/test_notifications_analytics.py::test_notifications_lifecycle PASSED [ 57%]
tests/test_notifications_analytics.py::test_analytics_overview_calculation PASSED [ 59%]
tests/test_proposals.py::test_submit_club_proposal_success PASSED        [ 61%]
tests/test_proposals.py::test_submit_duplicate_proposal_name_fails PASSED [ 63%]
tests/test_proposals.py::test_faculty_recommendation_and_hod_approval_workflow PASSED [ 65%]
tests/test_rbac_matrix.py (13 Matrix RBAC Tests across 5 roles) PASSED    [ 90%]
tests/test_uploads_security.py (5 Uploads Security Tests) PASSED         [100%]

======================== 52 passed, 1 warning in 3.25s ========================
```

### 2.2 Baseline Findings & Gaps in Backend
1. **Token Invalidation Gap**: `TokenVersion` exists on the `User` model, but is neither placed in JWT payloads nor evaluated on requests or refresh.
2. **Capacity Concurrency Gap**: Event registration uses an application-level `SELECT COUNT` followed by an insert, leaving an overbooking window during concurrent calls.
3. **MIME/Extension Verification Gap**: Upload checks rely on client-supplied `file.content_type` rather than magic bytes and strict extension validation.
4. **Brute Force Rate Limiting Gap**: Settings define `RATE_LIMIT_LOGIN_ATTEMPTS = 5` and `RATE_LIMIT_WINDOW_SECONDS = 60`, but no throttling logic is integrated into `POST /api/v1/auth/login`.

---

## 3. Frontend Baseline Verification

### 3.1 Execution Log
```text
$ npm run lint
  ! react(set-state-in-effect): Calling setState synchronously within an effect can trigger cascading renders
    ,-[src/App.tsx:57:5]
 57 |     fetchHealth()
    `----
Found 1 warning and 0 errors.

$ npx tsc -b
Done (0 errors).

$ npm run build
dist/index.html                   0.47 kB │ gzip:  0.30 kB
dist/assets/index-sLtRP0EN.css   33.02 kB │ gzip:  6.54 kB
dist/assets/index-DYEeOmch.js   238.32 kB │ gzip: 72.64 kB
✓ built in 144ms
```

### 3.2 Baseline Findings & Gaps in Frontend
1. **Missing Role-Specific Application Views**: The frontend currently consists of a single root dashboard (`App.tsx`). Full multi-role views for Students, Club Managers, Faculty Coordinators, HODs, and Administrators are unlinked or uncreated.
2. **Centralized Typed API Client Missing**: Calls are currently made using raw `fetch()` directly in components rather than through a dedicated service layer with automated token injection, refresh retry, and error normalization.
3. **No Session Storage / JWT Persistence**: Login state is not persisted in memory / storage across browser reloads.

---

## 4. Environmental Limitations & Isolation

- **Headless Browser Automation**: Antigravity's automated Playwright subagent cannot download the external Windows driver zip due to restricted network egress. All automated verification is performed via direct HTTP client assertions, `curl`, and unit/integration test suites.
- **Azure Cloud Services**: Azure SQL (`mssql+pyodbc`) and Azure Blob Storage are configured with local zero-cloud fallbacks (SQLite with PRAGMA foreign keys and local `./uploads` directory storage).
- **Test Database Isolation**: The pytest suite executes against an isolated in-memory SQLite database (`sqlite:///:memory:`) via `StaticPool`, completely preserving `backend/clubsphere_dev.db` and user data.
