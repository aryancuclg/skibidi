# ClubSphere — Backend Security Audit & Vulnerability Assessment

**Document Date:** October 18, 2026  
**Auditor:** Senior Security Specialist & Code Reviewer  
**Classification:** Internal Technical Security Audit  
**Status:** Verified Findings & Remediation Specifications

---

## 1. Vulnerability Findings Matrix

| Finding ID | Title | Severity | Affected Component / File | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | `TokenVersion` Revocation Mechanism Ignored in JWT Lifecycle | **HIGH** | `app/core/security.py`, `app/core/rbac.py`, `app/api/v1/auth.py` | Confirmed Gap |
| **SEC-02** | Missing Login Brute-Force Rate Limiting Enforcement | **MEDIUM** | `app/api/v1/auth.py`, `app/core/config.py` | Confirmed Gap |
| **SEC-03** | Incomplete File Upload Validation (Missing Extension & Magic Bytes) | **HIGH** | `app/core/storage.py`, `app/api/v1/uploads.py` | Confirmed Gap |
| **SEC-04** | Unrestricted Entity Attachment in Upload Endpoint | **MEDIUM** | `app/api/v1/uploads.py` | Confirmed Gap |
| **SEC-05** | Event Capacity Race Condition Under Concurrent Registrations | **MEDIUM** | `app/api/v1/events.py` | Confirmed Gap |
| **SEC-06** | Production Secret Fallback Insecure Default Risk | **LOW** | `app/core/config.py` | Hardened |

---

## 2. Detailed Technical Assessments

### 2.1 SEC-01: `TokenVersion` Revocation Ignored in JWT Lifecycle
- **Severity**: **HIGH** (CVSS: 7.5 - `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N`)
- **Affected Files**:
  - `backend/app/models/models.py` (Line 62: `TokenVersion = Column(Integer, default=1)`)
  - `backend/app/core/security.py` (`create_access_token`, `create_refresh_token`)
  - `backend/app/core/rbac.py` (`get_current_user`)
  - `backend/app/api/v1/auth.py` (`refresh_token_endpoint`)
- **Evidence**:
  ```python
  # security.py - lines 43-49
  payload: Dict[str, Any] = {
      "sub": str(subject),
      "role": role,
      "type": "access",
      "iat": int(now.timestamp()),
      "exp": int(expire.timestamp()),
  }
  # Notice: 'token_version' is completely absent from payload.
  ```
  ```python
  # rbac.py - lines 62-74
  user = db.query(User).filter(User.UserId == user_id).first()
  # Notice: user.TokenVersion is never compared against token claims!
  ```
- **Impact**: When a user changes their password, is banned, has privileges revoked, or requests a logout, active JWT access and refresh tokens cannot be invalidated until their natural expiration.
- **Remediation**:
  1. Embed `token_version: int` claim in all issued access and refresh tokens.
  2. In `get_current_user`, verify that `payload.get("token_version") == user.TokenVersion`. If not equal, raise `401 Unauthorized` ("Token has been revoked").
  3. In `refresh_token_endpoint`, verify `decoded.get("token_version") == user.TokenVersion`.
  4. Implement `POST /api/v1/auth/logout` that increments `user.TokenVersion` in database, invalidating all outstanding sessions instantly.

---

### 2.2 SEC-02: Missing Login Brute-Force Rate Limiting Enforcement
- **Severity**: **MEDIUM** (CVSS: 5.3)
- **Affected Files**:
  - `backend/app/core/config.py` (`RATE_LIMIT_LOGIN_ATTEMPTS = 5`, `RATE_LIMIT_WINDOW_SECONDS = 60`)
  - `backend/app/api/v1/auth.py` (`login`)
- **Evidence**:
  `login()` directly executes password verification without consulting or tracking failed attempts by IP or email address.
- **Impact**: Enables automated online dictionary and credential stuffing attacks against student, faculty, and administrator accounts.
- **Remediation**:
  Integrate an in-memory sliding-window tracker in `auth.py`. If failed attempts for an IP or email exceed 5 within 60 seconds, return `HTTP 429 Too Many Requests`.

---

### 2.3 SEC-03: Incomplete File Upload Validation (Missing Extension & Magic Bytes)
- **Severity**: **HIGH** (CVSS: 7.1)
- **Affected Files**:
  - `backend/app/core/storage.py` (`validate_file`)
- **Evidence**:
  ```python
  # storage.py - lines 25-36
  content_type = file.content_type or ""
  if content_type.lower() not in [t.lower() for t in allowed_list]:
      raise HTTPException(...)
  ```
  The MIME type check is performed solely on the client-supplied HTTP request header `Content-Type`. An attacker can upload an executable (`payload.exe`) or script by transmitting `Content-Type: image/png`.
- **Impact**: Malicious payloads or server-side scripts could be stored and served, leading to Stored XSS or potential remote code execution.
- **Remediation**:
  1. Validate file extension against strict allowlist (`.png`, `.jpg`, `.jpeg`, `.webp`, `.pdf`, `.docx`).
  2. Inspect magic byte signatures at the head of the file stream (e.g., `%PDF-` for PDF, `\x89PNG\r\n\x1a\n` for PNG, `\xff\xd8\xff` for JPEG, `RIFF....WEBP` for WebP, `PK\x03\x04` for DOCX).

---

### 2.4 SEC-04: Unrestricted Entity Attachment in Upload Endpoint
- **Severity**: **MEDIUM** (CVSS: 4.3)
- **Affected Files**:
  - `backend/app/api/v1/uploads.py` (`upload_document_or_media`)
- **Evidence**:
  The user supplies `entity_type` and `entity_id` as form inputs, but the backend does not verify whether `current_user` has permission to attach assets to that entity.
- **Impact**: A student could attach arbitrary files to another student's proposal or a club they do not manage.
- **Remediation**:
  Validate entity existence and caller ownership before creating the `UploadedFile` record. Provide a safe download endpoint with access checks.

---

### 2.5 SEC-05: Event Capacity Race Condition Under Concurrent Registrations
- **Severity**: **MEDIUM** (CVSS: 4.8)
- **Affected Files**:
  - `backend/app/api/v1/events.py` (`register_for_event`)
- **Evidence**:
  Application-level `SELECT COUNT(*)` followed by `if count >= capacity` and then `INSERT` without row-level locking on the `Event` entity.
- **Impact**: Multiple simultaneous students registering for the last available seat can cause the event to exceed its strict physical venue capacity.
- **Remediation**:
  Lock the `Event` record using `db.query(Event).filter(Event.EventId == event_id).with_for_update().first()` during registration to serialize capacity evaluations inside the transaction.

---

## 3. Verified Security Strengths in Existing Codebase

1. **Password Hashing**: Bcrypt with 12 salt rounds (`bcrypt.gensalt(12)`). Plaintext passwords are never stored, logged, or serialized.
2. **Strict Server-Side RBAC**: Authorization logic is executed server-side via FastAPI dependencies (`require_roles`, `check_club_ownership`).
3. **Synchronous Audit Trail**: Sensitive state changes (approvals, rejections, direct club creation, membership status changes) write to `AuditLogs` in the exact same database transaction, ensuring atomicity.
4. **Zero Tracked Secrets**: Real credentials are not present in Git history or source files; configuration uses `.env` with fallback to development defaults.
5. **Path Traversal Protection**: Filename sanitization (`sanitize_filename`) strips directory traversal sequences (`../`, `..\\`) and restricts filenames to safe alphanumeric characters.
