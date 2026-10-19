# ClubSphere — Future Updates Backlog

Ideas for future additions, based on what's already built (auth/RBAC, clubs, events +
registrations, approvals, attendance, outcomes, notifications, audit logs, uploads,
academics) and what's still open on the roadmap. All within **Aryan's backend scope**
unless noted.

---

## 🌟 High-Impact & Quick Wins (great for the 28 Oct mid-review demo)

1. **Waitlist + auto-promotion**
   - Schema already allows `waitlisted`, but registration just 409s at capacity.
   - On full: create a waitlisted registration; on cancel: atomically promote the
     earliest waitlisted user + notify them.
   - Small change, big logic/demo value (and a great race-condition test case).

2. **QR-code check-in**
   - Generate a signed, short-lived check-in token/QR per registration.
   - Club manager scans it to record attendance.
   - Turns attendance from a manual list into a demo-worthy flow.

3. **Search / filter / pagination**
   - `q`, date range, program, club, status filters + `limit/offset` on `/events`
     and `/clubs` lists.
   - Reviewers always try this first.

4. **ICS calendar export**
   - `/events/{id}.ics` or a per-user feed so students can import events into
     Google/Outlook Calendar. Cheap and impressive.

---

## 🏛️ Governance Depth (differentiators for a "club lifecycle" project)

5. **Event approval pipeline**
   - Right now only *club proposals* go through faculty→HOD approval; events jump
     draft→published directly.
   - Add multi-tier event approval (Manager → Faculty → HOD) reusing the existing
     `Approval` pattern. This is Phase 5's spirit.

6. **Budget requests per event**
   - Requested vs. approved budget columns + approval step.
   - Very "governance" and feeds Power BI nicely.

7. **Event feedback & ratings**
   - `EventFeedback` model (rating + comment, one per attendee), endpoints, and
     average rating in reporting views.

8. **Certificates**
   - Auto-generate a PDF certificate for attendees after an event outcome is
     submitted.

9. **Department model + HOD scoping**
   - Let HODs only see/manage their department's clubs & proposals
     (right now HOD appears global).

---

## 📊 Reporting (Phase 6 — unblocks Vanshika's Power BI)

10. **SQL views**
    - Club activity summary
    - Member participation leaderboard
    - Event fill-rate / capacity utilization
    - Approval turnaround time
    - Attendance per club

11. **CSV export** endpoints for rosters & attendance sheets.

---

## 🔒 Hardening & Infra (Phases 8–9)

12. **CI pipeline** — GitHub Actions: lint + pytest on every PR.

13. **Security pass**
    - Rate limiting on login/register
    - `bandit` + `pip-audit`
    - CORS lockdown
    - Security headers
    - Refresh-token rotation / logout-all via `TokenVersion`

---

## Priority Suggestion

- **Before mid-review (28 Oct):** waitlist + auto-promote, search/filter/pagination
- **Before cloud deploy:** event approval pipeline, reporting SQL views
- **Before final submission:** security hardening + CI
