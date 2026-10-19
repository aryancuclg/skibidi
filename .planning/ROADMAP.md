# Execution Roadmap — ClubSphere (Aryan's Scope)

## Phase Breakdown

### Phase 1: Project Scaffolding & Architecture Foundation
- Branch: `chore/project-scaffolding`
- Deliverables:
  - Python FastAPI project directory structure (`app/core`, `app/api`, `app/models`, `app/schemas`, `app/services`, `tests`).
  - Dependency configuration (`pyproject.toml` / `requirements.txt`).
  - `.env.example` and Pydantic Settings management.
  - Azure SQL connection setup using SQLAlchemy with health check `/health`.
  - Initial `docs/openapi.json` contract generation script.

### Phase 2: Authentication & 5-Role RBAC System
- Branch: `feature/auth-backend`
- Target Tag / Dependency: Towards `design-review-v1`
- Deliverables:
  - Password hashing (bcrypt / Argon2) and JWT token generation / verification.
  - Auth endpoints: `/auth/register`, `/auth/login`, `/auth/refresh`.
  - Dependency-based RBAC enforcement for: `Student`, `Club Manager`, `Faculty`, `HOD`, `Administrator`.
  - Comprehensive parametrized 403-denial matrix unit tests across all 5 roles.
  - Update `docs/openapi.json`.

### Phase 3: Club & Membership Lifecycle Management
- Branch: `feature/club-api`
- Target: Pre-Mid Review
- Deliverables:
  - Club CRUD endpoints (`/clubs`).
  - Membership request, join, approve/reject, and list endpoints (`/clubs/{id}/members`).
  - Role management within clubs (Club Lead / Manager vs Member).
  - Business logic unit tests and authorization enforcement.
  - Update `docs/openapi.json`.

### Phase 4: Event Engine & Capacity/Deadline Enforcement
- Branch: `feature/event-api`
- Target: Pre-Mid Review
- Deliverables:
  - Event CRUD endpoints (`/events`) with status lifecycle (Draft, Pending Approval, Published, Completed, Cancelled).
  - Registration endpoints (`/events/{id}/register`) with atomic capacity verification and deadline checks.
  - Duplicate registration protection.
  - Unit tests covering edge cases (race conditions on capacity, post-deadline registration attempt).
  - Update `docs/openapi.json`.

### Phase 5: Multi-Level Approval Pipeline & Synchronous Audit Logging
- Branch: `feature/approval-workflow`
- Target Tag: `mid-review-v1` (Deadline: 28 Oct 2026)
- Deliverables:
  - Multi-tier approval endpoints (Club Manager -> Faculty -> HOD / Admin).
  - Synchronous `AuditLogs` engine: Guarantees that state updates and audit log creation occur in the same DB transaction.
  - Audit trail retrieval endpoint for Administrators.
  - Comprehensive transactional failure tests (verifying rollback if audit record write fails).
  - Update `docs/openapi.json`.

### Phase 6: Attendance, Outcomes & Reporting SQL Views
- Branch: `feature/attendance`
- Target: Post-Mid Review
- Deliverables:
  - Attendance marking endpoints (`/events/{id}/attendance`).
  - Event outcomes & summary endpoints (`/events/{id}/outcomes`).
  - Author and validate optimized SQL Views in Azure SQL for Vanshika's Power BI dashboards.
  - Verification tests for reporting views and outcome data integrity.
  - Update `docs/openapi.json`.

### Phase 7: Azure Blob Storage Integration & File Security
- Branch: `feature/file-storage`
- Target: Cloud Integration
- Deliverables:
  - Azure Blob Storage integration using `azure-storage-blob` SDK.
  - File upload endpoints for club logos, event banners, and outcome attachments.
  - File security guardrails: MIME-type validation, payload size checks, safe filename hashing/sanitization.
  - File upload security test suite (disallowed file type & oversize rejection tests).
  - Update `docs/openapi.json`.

### Phase 8: Cloud Infrastructure, Containerization & CI/CD
- Branch: `feature/deploy-azure`
- Target Tag: `cloud-v1`
- Deliverables:
  - Production-ready `Dockerfile` and `docker-compose.yml`.
  - Azure App Service / Container Apps configuration and Azure Key Vault integration.
  - GitHub Actions backend CI/CD pipeline (lint, pytest, container build, deploy).
  - Azure deployment smoke tests (`/health` and live endpoint verification).

### Phase 9: Security Hardening & Milestone Audit
- Branch: `feature/security-hardening`
- Target Tags: `security-check-v1` (3 Nov 2026) -> `final-submission-v1` (6 Nov 2026)
- Deliverables:
  - Rate limiting on sensitive endpoints.
  - Secret scanning audit and vulnerability checks (`pip-audit` / `bandit`).
  - Full regression test run across all Aryan-owned test suites.
  - Joint sign-off with Vanshika on security and deployment stability.

---

### Phase Dependencies & Sequence
```
Phase 1 (Scaffolding & DB Setup)
   ↓
Phase 2 (Auth & RBAC Matrix)
   ↓
Phase 3 (Clubs & Memberships)
   ↓
Phase 4 (Events & Registrations)
   ↓
Phase 5 (Approvals & Sync Audit Log) ──► [Mid Review: 28 Oct 2026]
   ↓
Phase 6 (Attendance, Outcomes & SQL Views)
   ↓
Phase 7 (Azure Blob Storage & Upload Security)
   ↓
Phase 8 (Docker, Cloud Deploy & CI/CD) ──► [Cloud Deployment]
   ↓
Phase 9 (Security Hardening & Submission) ──► [Security Check: 3 Nov -> Final: 6 Nov]
```
