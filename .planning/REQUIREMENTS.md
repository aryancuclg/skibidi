# Requirements Specification — ClubSphere (Aryan's Scope)

## 1. Authentication & Role-Based Access Control (RBAC)
- **REQ-AUTH-01**: Secure registration (`/auth/register`) and login (`/auth/login`) generating JWT access & refresh tokens.
- **REQ-AUTH-02**: Token refresh endpoint (`/auth/refresh`) with expiration validation.
- **REQ-AUTH-03**: Role enforcement via FastAPI dependency injection supporting 5 explicit roles:
  1. `Student`
  2. `Club Manager`
  3. `Faculty`
  4. `HOD`
  5. `Administrator`
- **REQ-AUTH-04**: Server-side 403 Forbidden enforcement on every protected endpoint (no reliance on frontend visibility).
- **REQ-AUTH-05**: Automated parametrized 403-denial matrix testing verifying permission boundaries across all 5 roles.

## 2. Club & Membership Management
- **REQ-CLUB-01**: Club CRUD endpoints with role-based restrictions (Creation/approval flow, club profile updates).
- **REQ-CLUB-02**: Membership application, approval, and listing endpoints (`/clubs/{id}/members`).
- **REQ-CLUB-03**: Club role assignment/update endpoints restricted to authorized Club Managers and Admins.

## 3. Event Management & Registrations
- **REQ-EVENT-01**: Event lifecycle CRUD endpoints (`/events`) with draft, submitted, approved, and cancelled statuses.
- **REQ-EVENT-02**: Enforce strict registration rules:
  - Event capacity cap check before confirming registration.
  - Registration deadline enforcement (rejection after deadline timestamp).
  - Prevention of duplicate registrations per student.
- **REQ-EVENT-03**: Event attendance tracking endpoint (`/events/{id}/attendance`) for recording present/absent statuses.
- **REQ-EVENT-04**: Event outcomes reporting endpoints (`/events/{id}/outcomes`) for post-event summary, attendee counts, and metrics.

## 4. Multi-Level Approval Workflow & Audit Logging
- **REQ-APPR-01**: Hierarchical event/club approval pipeline (Club Manager -> Faculty -> HOD / Admin).
- **REQ-APPR-02**: **Strict Synchronous Audit Logging**: Every approval, rejection, role change, and admin modification MUST write an `AuditLogs` entry in the *exact same database transaction* as the state change. If audit log insertion fails, the entire transaction rolls back.
- **REQ-APPR-03**: Audit log query endpoints restricted strictly to `Administrator` and authorized audit roles.

## 5. Storage & File Security
- **REQ-FILE-01**: Integration with Azure Blob Storage via `azure-storage-blob` SDK for event posters, club logos, and attachments.
- **REQ-FILE-02**: Strict upload validation *prior* to Blob handoff:
  - MIME-type validation (whitelisted file types only).
  - Maximum payload size limit enforcement.
  - Sanitization of stored filenames to prevent path traversal or injection.

## 6. Infrastructure, Cloud Deployment & Security
- **REQ-INFRA-01**: Containerization via `Dockerfile` and `docker-compose.yml` for reproducible local and staging environments.
- **REQ-INFRA-02**: Deployment automation to Azure App Service / Azure Container Apps with Azure Key Vault secrets injection and Azure SQL firewall configuration.
- **REQ-INFRA-03**: Smoke test health check endpoint (`/health`) verifying database connectivity, storage reachability, and returning 200 OK.
- **REQ-INFRA-04**: Rate limiting middleware on sensitive routes (`/auth/*`, file upload endpoints).
- **REQ-INFRA-05**: Strict separation of configuration via `.env.example` and environment variables (zero hardcoded secrets).

## 7. API Contract & Reporting Views
- **REQ-SPEC-01**: Single source of truth OpenAPI spec maintained and exported to `docs/openapi.json` for Vanshika's frontend integration.
- **REQ-VIEW-01**: Optimized SQL Views defined and validated in Azure SQL to power Power BI dashboards (event participation metrics, club activity statistics, approval timelines).

## 8. Out-of-Scope / Deferred (Strict Boundaries)
- **OOS-01**: Frontend components, React hooks, UI designs, and client routing (Owned by Vanshika).
- **OOS-02**: Alembic migration script authorship (Owned by Vanshika; Aryan reviews schema compatibility).
- **OOS-03**: Redis caching and recommendation ranking (Deferred to post-MVP / Phase 7+, expendable under timeline constraints).
