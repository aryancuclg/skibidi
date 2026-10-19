# ClubSphere — Prioritized Incremental Implementation Plan

**Document Version:** 1.0.0  
**Status:** Approved for Phased Execution

---

## 1. Plan Overview & Engineering Principles

This implementation plan addresses verified audit findings systematically without destructive rewrites, keeping working functionality intact while introducing required security controls, concurrency guarantees, and complete frontend role views.

---

## 2. Priority 0 — Security & Data Integrity

### Task P0.1: Enforce `TokenVersion` Revocation & Add Logout Endpoint
- **Problem:** `TokenVersion` is present in `User` model but omitted from JWTs and unchecked on requests. Revocation does not work.
- **Affected Files:**
  - `backend/app/core/security.py`: Add `token_version` claim to `create_access_token` and `create_refresh_token`.
  - `backend/app/core/rbac.py`: In `get_current_user`, verify token `token_version == user.TokenVersion`.
  - `backend/app/api/v1/auth.py`: Verify `token_version` on `/refresh`. Add `POST /api/v1/auth/logout` that increments `user.TokenVersion`.
- **Verification:** Unit tests asserting that incrementing `TokenVersion` immediately invalidates previously issued access & refresh tokens with 401 Unauthorized.

### Task P0.2: Enforce Login Rate-Limiting & Brute-Force Throttling
- **Problem:** `RATE_LIMIT_LOGIN_ATTEMPTS` in settings is unenforced, allowing unlimited credential attacks.
- **Affected Files:**
  - `backend/app/api/v1/auth.py`: Implement sliding-window failed attempt tracker by client IP and email.
- **Verification:** Test verifying that 5 failed attempts trigger `HTTP 429 Too Many Requests`.

### Task P0.3: Harden Upload Validation with File Signatures & Extension Allowlist
- **Problem:** `validate_file` trusts client header `Content-Type`; lacks magic byte and extension checks.
- **Affected Files:**
  - `backend/app/core/storage.py`: Validate file extension (`.png`, `.jpg`, `.jpeg`, `.webp`, `.pdf`, `.docx`) and verify binary magic bytes (file signature).
  - `backend/app/api/v1/uploads.py`: Add `GET /api/v1/uploads/{file_id}` to serve files with access control.
- **Verification:** Tests uploading executable masquerading as PNG (rejected), and valid image/pdf (accepted).

### Task P0.4: Mitigate Event Capacity Concurrency Window
- **Problem:** Concurrent registrations can exceed event capacity because `SELECT COUNT` is not row-locked.
- **Affected Files:**
  - `backend/app/api/v1/events.py`: Lock the `Event` row (`with_for_update()`) during registration to serialize seat evaluation.
- **Verification:** Concurrency test verifying capacity limit cannot be exceeded.

---

## 3. Priority 1 — Reliability & Business Logic Integrity

### Task P1.1: Ensure Role Transition & Proposal Concurrency
- **Problem:** When HOD approves a club proposal, applicant's role should be upgraded to `Club Manager` in `Users.RoleId` if they were `Student`, allowing them full manager capabilities.
- **Affected Files:**
  - `backend/app/api/v1/proposals.py`: Update applicant `User.RoleId` to `Club Manager` on HOD approval. Lock proposal row to prevent duplicate review decisions.
- **Verification:** Test asserting proposal approval automatically promotes applicant role and assigns club manager permissions.

### Task P1.2: Standardize Timezone Handling
- **Problem:** Discrepancy between timezone-aware and timezone-naive timestamps across SQLite and Azure SQL.
- **Affected Files:**
  - `backend/app/models/models.py`, `backend/app/api/v1/events.py`
- **Verification:** Ensure all datetime checks use normalized UTC naive timestamps.

---

## 4. Priority 2 — Product Functionality & Frontend Integration

### Task P2.1: Centralized Typed API Client
- **Deliverable:** `frontend/src/api/client.ts` with typed methods for auth, clubs, events, proposals, notifications, uploads, and admin endpoints.
- **Features:** Automated Bearer token injection, token storage, and error parsing.

### Task P2.2: Complete Multi-Role Interactive Application
- **Deliverable:** Upgraded frontend with authentication (Login/Register/Logout) and role-tailored dashboards:
  - **Student View:** Browse clubs, request membership, submit proposals, register for events, cancel registration, view notifications.
  - **Club Manager View:** Manage club profile, review membership requests (approve/reject/promote), create events, check in attendees, submit outcome reports.
  - **Faculty View:** Review department club proposals (recommend/request changes/reject).
  - **HOD View:** Final proposal approval (activates club), view departmental statistics.
  - **Administrator View:** Create clubs directly, query audit logs, view institutional analytics overview.

---

## 5. Priority 3 — Quality Gates & Verification

- Update OpenAPI documentation (`docs/openapi.json`).
- Run all backend tests (`pytest -v`) to achieve 100% pass rate.
- Run frontend checks (`npx tsc -b`, `npm run build`, `npm run lint`).
- Ensure `python app.py` launches both systems flawlessly.
