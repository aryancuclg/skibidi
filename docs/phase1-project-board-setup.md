# ClubSphere Phase 1 GitHub Project Board Setup

## Board details

- Board name: ClubSphere Phase 1
- Board description: Track Phase 1 requirements, architecture, proposal alignment, frontend, and shared repository setup through Design Review.
- Suggested status values: Backlog, Ready, In Progress, In Review, Done.
- Suggested labels: phase-1, requirements, architecture, proposal-gap, frontend, backend, database, documentation.
- Tentative target: Design Review is listed as October 19, 2026 in the revised plan; confirm the date with the project lead.

## Initial issue cards

| Title | Owner | Labels | Completion criteria |
| --- | --- | --- | --- |
| Review Phase 1 requirements and architecture draft | Aryan | phase-1, requirements, architecture | Review `docs/phase1-requirements-architecture.md`; record changes or approval in the issue. |
| Resolve database and cloud baseline against proposal | Both | phase-1, proposal-gap, database | Confirm Azure SQL/Azure hosting versus the proposal's PostgreSQL/generic-cloud language; record the decision and align project documents. |
| Confirm event approval and notification MVP scope | Both | phase-1, requirements, proposal-gap | Decide whether events need a separate approval stage and whether in-app notifications are MVP; update requirements and proposal-gap register. |
| Align proposal and SDD project name to ClubSphere | Vanshika | phase-1, documentation | Update titles and references in the proposal and SDD, then get Aryan's review. |
| Finish proposal gap review | Vanshika | phase-1, proposal-gap | Review every row in `docs/proposal-gap-review.md`; assign an owner and disposition to each open item. |
| Create shared repository scaffold and Docker Compose baseline | Aryan | phase-1, backend | Add the agreed backend, db, docs, and tests structure plus backend starter and local Compose setup. |
| Add root README and verify clean-checkout setup | Both | phase-1, documentation | Document prerequisites and run steps; each partner verifies the project from a clean checkout. |
| Complete ClubSphere frontend scaffold | Vanshika | phase-1, frontend | React/Vite/Tailwind frontend is in the repository; `npm run lint` and `npm run build` pass. |

## Current status

- Requirements and architecture draft: prepared locally; awaiting Aryan review.
- Proposal gap register: prepared locally; decisions listed above remain open.
- Frontend scaffold: pushed to `main` in commit `a13e7ca`.
- GitHub Project board: not yet created; the current browser session is signed out of GitHub.
