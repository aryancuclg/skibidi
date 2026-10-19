# ClubSphere — Aryan's Complete Backend Implementation Report

**Document Date:** October 17, 2026  
**Author:** Aryan (Backend & Systems Architect)  
**Project:** ClubSphere — University Club & Activity Lifecycle Management System  
**Version:** 1.0.0  

---

## 1. Repository Assessment (Before Changes)

- **Initial Repository State**:
  - The repository was initialized with a React 19 + Vite frontend scaffold (`frontend/`), documentation drafts (`docs/ClubSphere_System_Design_Document.docx`, `ClubSphere_Revised_Execution_Plan.docx`, `phase1-requirements-architecture.md`, `proposal-gap-review.md`), and GSD planning files (`.planning/`).
  - **No backend implementation existed** prior to this work (`backend/` was completely uninitialized).
  - The working tree was clean on branch `main`.
- **Ownership Verification**:
  - **Aryan (Owner)**: Complete FastAPI modular monolith backend, database integration models/views, cloud configuration, security controls, RBAC enforcement, synchronous audit logging, automated test suites, and OpenAPI contract authoring (`docs/openapi.json`).
  - **Vanshika (Partner — Strict Boundary Preserved)**: React frontend, Alembic migration files authorship, Power BI dashboard design, and presentation materials. Zero frontend or migration files were touched or overwritten.

---

## 2. Implementation Summary

A complete, secure, modular monolith backend has been implemented in `backend/`:

1. **Architecture & Foundation**:
   - Python 3.11+ / FastAPI application with versioned REST API prefix (`/api/v1`).
   - Pydantic v2 schemas for all requests and responses with field-level validations.
   - SQLAlchemy 2.0 ORM models matching the System Design Document (SDD Section 3.5) specification.
   - Dual-database connectivity: Seamless support for Azure SQL Database (`mssql+pyodbc`) in production and SQLite with foreign key pragma enforcement for local zero-dependency testing and development.
2. **Authentication & RBAC (5 Roles)**:
   - Password hashing with salt rounds using `bcrypt`.
   - JWT access token (15-minute expiration) and refresh token (7-day expiration) issuance and validation.
   - Strict server-side RBAC dependencies enforcing access across all 5 roles: `Student`, `Club Manager`, `Faculty`, `HOD`, and `Administrator`.
   - Club resource ownership checks ensuring Club Managers can only manage their own clubs and events.
3. **Club & Membership Management**:
   - Discovery, filtering, and search endpoints with pagination.
   - Membership join requests (`/clubs/{id}/join`), duplicate prevention (`UQ_Club_User`), membership approval/rejection, and member listing with role assignments (`Member` / `Lead`).
4. **Event Lifecycle, Capacity & Deadlines**:
   - Event creation and profile updates with constraint checking (`RegistrationDeadline <= EventDate` and `Capacity > 0`).
   - Student event registration (`/events/{id}/register`) enforcing:
     - Rejection of registrations after the deadline (400 Bad Request).
     - Strict capacity cap check inside the write transaction; rejection on full capacity (409 Conflict).
     - Duplicate registration prevention (`UQ_Event_User_Reg`).
   - Attendance recording (`/events/{id}/attendance`) strictly restricted to confirmed registrants only.
   - Post-event outcomes reporting (`/events/{id}/outcomes`) snapshotting verified attendance counts.
5. **Multi-Tier Club Proposal & Approval Workflow**:
   - Student proposal submission (`/proposals`).
   - Two-stage review pipeline: `Faculty` recommendation stage and `HOD` final decision stage.
   - Mandatory non-empty comment enforcement for `reject` and `changes_requested`.
   - **Automatic Club Activation**: Upon final approval by HOD / Administrator, the system automatically creates and activates the `Club` record, sets the applicant as the manager, and enrolls them as an active `Lead` member.
6. **Synchronous Audit Logging**:
   - Every approval, rejection, direct club creation, membership update, and status change writes an entry to `AuditLogs` in the *exact same database transaction*.
   - If audit logging fails, the entire transaction rolls back atomically, preventing orphaned state changes.
7. **Institutional Analytics & Power BI Views**:
   - Live analytics overview (`/admin/analytics/overview`) computed from real relational data.
   - 4 optimized SQL Views authored in `backend/sql/power_bi_views.sql` (`vw_EventRegistrationSummary`, `vw_AttendanceRate`, `vw_ClubActivity`, `vw_DepartmentParticipation`).
8. **File Upload Security & Azure Blob Storage**:
   - MIME-type allowlist validation (`image/png`, `image/jpeg`, `image/webp`, `application/pdf`, `docx`).
   - Payload size limit enforcement (10 MB cap).
   - Filename sanitization preventing directory traversal (`../../`).
   - Azure Blob Storage client with local storage fallback for offline/local environments.
9. **Health & Readiness Smoke Checks**:
   - Dual probes at `/health` and `/api/v1/health` verifying database connectivity via `SELECT 1`.
10. **Containerization**:
    - Production `backend/Dockerfile` and `docker-compose.yml`.

---

## 3. Files Created and Modified

| File Path | Description |
| :--- | :--- |
| `backend/app/main.py` | FastAPI app factory, CORS middleware, lifespan events, health routes, versioned router mounting |
| `backend/app/core/config.py` | Pydantic Settings for DB, JWT, CORS, Azure Storage, and rate limits |
| `backend/app/core/database.py` | SQLAlchemy engine, session generator (`get_db`), SQLite FK pragma listener, healthcheck |
| `backend/app/core/security.py` | Bcrypt password hashing/verification, JWT access & refresh token encode/decode |
| `backend/app/core/rbac.py` | 5-role RBAC dependency factories, role normalization, club ownership verification |
| `backend/app/core/audit.py` | Synchronous transactional audit logger |
| `backend/app/core/storage.py` | MIME allowlist validation, file size limit, filename sanitization, Azure Blob Storage client |
| `backend/app/models/models.py` | 14 SQLAlchemy models matching SDD Section 3.5 |
| `backend/app/schemas/` | Pydantic v2 schemas: `auth.py`, `club.py`, `event.py`, `proposal.py`, `notification.py`, `audit.py`, `analytics.py`, `upload.py` |
| `backend/app/api/v1/` | REST API routers: `auth.py`, `clubs.py`, `events.py`, `proposals.py`, `notifications.py`, `admin.py`, `uploads.py`, `health.py`, `router.py` |
| `backend/sql/azure_sql_schema.sql` | Complete T-SQL DDL schema for Azure SQL Database |
| `backend/sql/power_bi_views.sql` | 4 optimized SQL views for Power BI institutional dashboards |
| `backend/sql/seed_data.sql` | Fictitious demo data with `@univ.edu` test identities |
| `backend/scripts/export_openapi.py` | Automation script exporting live OpenAPI spec to `docs/openapi.json` |
| `docs/openapi.json` | Exported OpenAPI 3.1.0 specification with 26 documented endpoints |
| `backend/Dockerfile` | Production container build for Azure App Service / Container Apps |
| `docker-compose.yml` | Local multi-service compose configuration |
| `backend/requirements.txt` | Python dependencies |
| `backend/pyproject.toml` | Packaging & pytest configuration |
| `backend/.env.example` | Environment template with zero real secrets |
| `.gitignore` | Git ignore rules protecting against credentials, db files, and test caches |
| `backend/tests/` | 10 pytest test suites (52 tests total) |

---

## 4. API Documentation (26 Implemented Endpoints)

| HTTP Method | Path | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health`, `/api/v1/health` | Public | Readiness and database connectivity smoke check |
| `POST` | `/api/v1/auth/register` | Public | Student account registration (Bcrypt hashed) |
| `POST` | `/api/v1/auth/login` | Public | Authenticates credentials; returns JWT access & refresh tokens |
| `POST` | `/api/v1/auth/refresh` | Authenticated | Exchanges valid refresh token for rotated token pair |
| `GET` | `/api/v1/auth/me` | Authenticated | Returns current authenticated user profile |
| `GET` | `/api/v1/clubs` | Public / Filtered | List and search clubs with pagination |
| `GET` | `/api/v1/clubs/{id}` | Public | Detailed club profile and active member statistics |
| `POST` | `/api/v1/clubs` | `Administrator` | Direct club creation override |
| `PUT` | `/api/v1/clubs/{id}` | `Club Manager` (Owner), `Admin` | Update club profile, description, or status |
| `POST` | `/api/v1/clubs/{id}/join` | `Student` / Authenticated | Request membership; duplicate join rejected |
| `GET` | `/api/v1/clubs/{id}/members` | `Club Manager` (Owner), `Admin` | List club members and applicant requests |
| `PUT` | `/api/v1/clubs/{id}/members/{id}`| `Club Manager` (Owner), `Admin` | Approve/reject membership or change member role |
| `GET` | `/api/v1/events` | Public | List published events with live seat calculations |
| `GET` | `/api/v1/events/{id}` | Public | Event details, registration deadline, and available seats |
| `POST` | `/api/v1/events` | `Club Manager` (Owner), `Admin` | Create event with deadline & capacity validation |
| `PUT` | `/api/v1/events/{id}` | `Club Manager` (Owner), `Admin` | Update event details or change event status |
| `POST` | `/api/v1/events/{id}/register` | `Student` / Authenticated | Register for event (enforces deadline & capacity cap) |
| `DELETE` | `/api/v1/events/{id}/register` | `Student` (Registrant) | Cancel an active event registration |
| `GET` | `/api/v1/events/{id}/registrations`| `Club Manager` (Owner), `Admin` | Event roster with check-in status flags |
| `POST` | `/api/v1/events/{id}/attendance`| `Club Manager` (Owner), `Admin` | Record attendance (confirmed registrants only) |
| `GET` | `/api/v1/events/{id}/outcomes` | Public | Retrieve post-event outcome summary and verified metrics |
| `POST` | `/api/v1/events/{id}/outcomes` | `Club Manager` (Owner), `Admin` | Submit post-event report; marks event completed |
| `POST` | `/api/v1/proposals` | Any Authenticated User | Submit club proposal for faculty review |
| `GET` | `/api/v1/proposals` | Role-Scoped | List proposals (applicants see own; reviewers see pending) |
| `GET` | `/api/v1/proposals/{id}` | Role-Scoped | Full proposal details with review history |
| `POST` | `/api/v1/proposals/{id}/review` | `Faculty` (Stage 1), `HOD` (Stage 2) | Record review; HOD approval auto-activates Club |
| `GET` | `/api/v1/notifications` | Authenticated | List in-app notifications with unread count |
| `PUT` | `/api/v1/notifications/{id}/read`| Authenticated (Owner) | Mark single notification as read |
| `PUT` | `/api/v1/notifications/read-all`| Authenticated | Mark all notifications as read |
| `GET` | `/api/v1/admin/analytics/overview`| `Administrator`, `HOD` | Real-time database aggregates for dashboards |
| `GET` | `/api/v1/admin/audit-logs` | `Administrator` | Query immutable audit log with filters |
| `POST` | `/api/v1/uploads` | Authenticated | Validated file upload (MIME/size/path traversal safe) |

---

## 5. Security Improvements & Verification

1. **Server-Enforced RBAC**: Every protected endpoint declares explicit FastAPI dependencies (`require_roles`, `check_club_ownership`). Frontend hidden buttons are never treated as a security boundary.
2. **Password & Token Security**:
   - Bcrypt with 12 salt rounds; passwords never stored or logged in plaintext.
   - JWT signatures verified on every call; expired tokens return `401 Unauthorized`.
3. **Synchronous Audit Trail**:
   - `AuditLogs` entries written inside the exact same database transaction as approvals, rejections, direct club creations, and role changes.
   - Verified that if an audit entry fails, the entire transaction rolls back cleanly.
4. **Race Condition & Overbooking Mitigations**:
   - Registration re-checks `confirmed` registration counts inside the database write transaction before committing.
   - `UQ_Event_User_Reg` database constraint prevents double registrations.
   - Deadline validation strictly enforces that current UTC time <= `RegistrationDeadline`.
5. **Upload Protection**:
   - MIME-type allowlist check rejects executables and disallowed payloads with `400 Bad Request`.
   - Payload size cap rejects files > 10MB with `413 Content Too Large`.
   - Filename sanitization strips relative path characters (`../`) to block path traversal.
6. **Zero Hardcoded Secrets**:
   - All credentials and secrets injected via environment variables.
   - `.env` excluded from version control via `.gitignore`.

---

## 6. Testing Results

**Test Runner**: `pytest 9.1.1` on Python 3.15.0  
**Command**: `python -m pytest backend/tests -v`  
**Result**: **52 PASSED, 0 FAILED** (100% pass rate)

```text
backend/tests/test_health.py::test_root_health_check PASSED
backend/tests/test_health.py::test_api_v1_health_check PASSED
backend/tests/test_auth.py::test_register_student_success PASSED
backend/tests/test_auth.py::test_register_duplicate_email_fails PASSED
backend/tests/test_auth.py::test_login_success PASSED
backend/tests/test_auth.py::test_login_invalid_password_fails PASSED
backend/tests/test_auth.py::test_refresh_token_success PASSED
backend/tests/test_auth.py::test_refresh_token_invalid_fails PASSED
backend/tests/test_auth.py::test_auth_me_endpoint PASSED
backend/tests/test_auth.py::test_auth_me_unauthorized_fails PASSED
backend/tests/test_rbac_matrix.py (Parametrized 403 Matrix across 5 roles) PASSED [13 tests]
backend/tests/test_clubs.py::test_list_clubs_public PASSED
backend/tests/test_clubs.py::test_get_club_details PASSED
backend/tests/test_clubs.py::test_join_club_success PASSED
backend/tests/test_clubs.py::test_join_club_duplicate_fails PASSED
backend/tests/test_clubs.py::test_list_club_members_by_manager PASSED
backend/tests/test_clubs.py::test_list_club_members_denied_for_unauthorized_student PASSED
backend/tests/test_clubs.py::test_update_membership_status PASSED
backend/tests/test_clubs.py::test_update_club_profile_by_manager PASSED
backend/tests/test_clubs.py::test_update_club_profile_denied_for_other_user PASSED
backend/tests/test_events.py::test_create_event_success PASSED
backend/tests/test_events.py::test_create_event_deadline_after_event_fails PASSED
backend/tests/test_events.py::test_event_registration_success PASSED
backend/tests/test_events.py::test_event_registration_duplicate_fails PASSED
backend/tests/test_events.py::test_event_capacity_exhaustion_fails PASSED
backend/tests/test_events.py::test_event_past_deadline_rejected PASSED
backend/tests/test_events.py::test_cancel_registration PASSED
backend/tests/test_proposals.py::test_submit_club_proposal_success PASSED
backend/tests/test_proposals.py::test_submit_duplicate_proposal_name_fails PASSED
backend/tests/test_proposals.py::test_faculty_recommendation_and_hod_approval_workflow PASSED
backend/tests/test_audit_sync.py::test_audit_log_written_synchronously_on_approval PASSED
backend/tests/test_audit_sync.py::test_transactional_rollback_if_audit_fails PASSED
backend/tests/test_attendance_outcomes.py::test_attendance_and_outcomes_lifecycle PASSED
backend/tests/test_notifications_analytics.py::test_notifications_lifecycle PASSED
backend/tests/test_notifications_analytics.py::test_analytics_overview_calculation PASSED
backend/tests/test_uploads_security.py::test_upload_valid_file_success PASSED
backend/tests/test_uploads_security.py::test_upload_disallowed_mime_type_fails PASSED
backend/tests/test_uploads_security.py::test_upload_empty_file_fails PASSED
backend/tests/test_uploads_security.py::test_filename_sanitization_prevents_path_traversal PASSED
backend/tests/test_uploads_security.py::test_upload_oversized_file_fails PASSED

======================== 52 passed in 4.16s ========================
```

---

## 7. Database Coordination (For Vanshika)

- **Schema Compatibility**: All 14 SQLAlchemy models match the agreed SDD Section 3.5 schema exactly.
- **Reference T-SQL DDL**: Provided in `backend/sql/azure_sql_schema.sql` for reference when authoring Alembic migration scripts.
- **Reporting Views**: 4 SQL views ready to be deployed to Azure SQL for Power BI dashboard design in `backend/sql/power_bi_views.sql`.
- **Synthetic Seed Data**: Complete demo script with synthetic `@univ.edu` identities in `backend/sql/seed_data.sql`.

---

## 8. Frontend Coordination (For Vanshika)

- **OpenAPI 3.1 Contract**: The single source of truth API contract has been exported directly from the live FastAPI app and is saved at `docs/openapi.json`.
- **Authentication Handshake**:
  - `POST /api/v1/auth/login` returns `{ "access_token": "...", "refresh_token": "...", "role": "Student", "user_id": 1, ... }`.
  - Include header: `Authorization: Bearer <access_token>` on protected routes.
- **Pagination Shape**: All listing routes return a consistent envelope: `{ "items": [...], "total": 12, "page": 1, "page_size": 20 }`.
- **CORS Configured**: Default allowed origins include `http://localhost:5173` (Vite) and `http://localhost:3000`.

---

## 9. Configuration & Local Execution Instructions

### Local Development (Zero Cloud Dependencies Required)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server (auto-creates local SQLite tables & baseline demo seed on startup):
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
4. Access interactive API documentation:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`
   - Health check: `http://localhost:8000/health`
5. Run the test suite:
   ```bash
   pytest tests -v
   ```

### Docker Local Run
```bash
docker compose up --build
```

---

## 10. Remaining Work & Next Steps

- **Alembic Migrations**: Vanshika to author migration revisions using `backend/sql/azure_sql_schema.sql` as the target schema reference.
- **Frontend Integration**: Vanshika to wire React pages against the endpoints documented in `docs/openapi.json`.
- **Cloud Provisioning**: When Azure SQL and Azure Blob Storage are provisioned for staging, set `DATABASE_URL` and `AZURE_STORAGE_CONNECTION_STRING` in Azure App Service application settings. All local tests run independently with SQLite and local file storage.
