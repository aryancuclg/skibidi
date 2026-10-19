# Project: ClubSphere (University Club & Activity Lifecycle Management System)

## Project Overview
**ClubSphere** is a University Club & Activity Lifecycle Management System built by a two-person team (**Aryan** & **Vanshika**) under strict academic/production milestones leading to Final Submission on **6 Nov 2026**.

## Team Responsibilities & Ownership Boundaries
- **Aryan (Owner & Scope of this AI Assistant)**:
  - **Backend**: Python 3.11+, FastAPI, Pydantic v2, pytest.
  - **Database Integration**: Azure SQL Database integration, reviews schema & constraints for backend compatibility (Alembic migration execution & model mapping).
  - **Cloud Infra & DevOps**: Azure Blob Storage (`azure-storage-blob` SDK), Azure Key Vault, Azure SQL firewall/provisioning, Docker, Docker Compose, Azure App Service / Container Apps, GitHub Actions CI/CD (backend pipeline).
  - **Auth & Security**: JWT issuance/verification, server-side RBAC dependencies across 5 roles (`Student`, `Club Manager`, `Faculty`, `HOD`, `Administrator`), rate limiting, file upload security checks (MIME/size validation before Blob Storage), secret scanning.
  - **Core Business Logic**: Club CRUD, Event CRUD, Memberships, Registration (capacity & deadline checks), Approval workflows + synchronous Audit Logging (`AuditLogs` table written in the same transaction), Attendance, Event Outcomes.
  - **API Contract & Reporting Views**: Authoring & publishing `docs/openapi.json` as single source of truth; writing & maintaining optimized SQL views for Power BI.
  - **Owned Testing**: Unit tests, Parametrized 403-denial RBAC matrix test suite across all 5 roles, file upload security tests, cloud deployment smoke tests (`/health`).

- **Vanshika (Partner - STRICT BOUNDARY)**:
  - Frontend development (React, Vite, Tailwind CSS components, pages, routing, state).
  - Authorship of Alembic migration scripts.
  - Authorship of Mermaid/ER diagrams.
  - Power BI dashboard designs.
  - API / Contract integration tests & end-to-end integration tests.
  - Project reports and presentation/demo scripts.
  - *Rule*: This assistant **MUST NOT** generate, edit, or touch frontend components, frontend routes, Alembic migration authorship, or reports. If asked, halt and alert that it crosses into Vanshika's territory.

## Target Milestones
| Milestone | Target Date | Git Milestone Tag |
| :--- | :--- | :--- |
| **Design Review** | Initial | `design-review-v1` |
| **Mid Review** | 28 Oct 2026 | `mid-review-v1` |
| **Cloud Deployment** | Early Nov 2026 | `cloud-v1` |
| **Security Check** | 03 Nov 2026 | `security-check-v1` |
| **Final Submission**| 06 Nov 2026 | `final-submission-v1` |

## Branching & Commit Conventions
- **Base branches**: `develop` (active development), `main` (milestone tags).
- **Feature Branches**:
  - `feature/auth-backend`
  - `feature/club-api`
  - `feature/event-api`
  - `feature/approval-workflow`
  - `feature/attendance`
  - `feature/deploy-azure`
  - `feature/security-hardening`
  - `fix/<short-desc>`
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
- **Secrets Policy**: NEVER commit real secrets or `.env`. Maintain `.env.example` with placeholders; Azure Key Vault and GitHub Actions Secrets for environments.
- **Workflow**: Open PR when acceptance criteria can be demonstrated; Vanshika reviews every PR; squash-merge into `develop`.
