# Explore Note — Mid-Review Crunch Strategy

Status: **PROVISIONAL** — produced by `/gsd:explore` session, 18 Oct 2026. Items marked
`[UNCONFIRMED]` are assumptions or open questions, not decisions. Replace with recorded
decisions once Aryan and Vanshika confirm.

## Session topic

Mid-review crunch strategy: 10 days (18–28 Oct 2026), Phases 1–5 stacked before
`mid-review-v1`, one backend owner (Aryan), zero backend code written.

## Open questions (answer → then record as decisions)

1. `[UNCONFIRMED]` What is actually evaluated at Mid Review on 28 Oct? Full end-to-end
   lifecycle demo vs working-API happy-path vs design defense. Strategy branches on this.
2. `[UNCONFIRMED]` Aryan's realistic capacity 18–28 Oct (h/day). Determines whether
   Phases 1–5 as written are feasible or a vertical slice is mandatory.
3. The three unresolved gap-review decisions (Azure SQL baseline, event-approval workflow
   in/out of MVP, notifications in/out of MVP) — these gate Design Review finalization
   (`docs/proposal-gap-review.md`) **and** define Phase 5's size. Settle first.
4. When is Design Review, and what must it contain? (`design-review-v1` has no date.)
5. Is the student Azure account provisioned, with credits? (gap-review question 4.)
6. Vanshika's frontend timeline and whether she can build against a mocked
   `docs/openapi.json` contract.

## Analysis

### Structural insights

- **First move is scope, not code.** The three open gap decisions are cheap to settle and
  gate both Design Review and phase sizing.
- **Contract-first parallelization.** The P1→P5 chain is sequential for the backend, but
  the frontend is blocked only on the OpenAPI contract. Export `docs/openapi.json` at the
  end of Phase 1/early Phase 2 so Vanshika builds against mocks in parallel.
- **Do not let Azure SQL block Day 1.** Use a local SQL container behind the same
  SQLAlchemy layer for Phases 1–6; connection-string swap is a Phase 8 concern. Confirm
  Azure account availability separately.
- **Buffer target:** finish Phase 5 by 25–26 Oct; reserve 25–27 Oct for integration,
  synthetic seed data (NFR-04), demo-path hardening; tag `mid-review-v1` on 27 Oct.

### Pre-agreed cut list (pull before the night of 27 Oct)

Ordered cheapest-first:

| Cut | Cost / notes |
| --- | --- |
| Drop EventOutcomes | Zero — sanctioned by revised plan at Mid Review |
| Defer in-app notifications | Zero — not in the 9-phase roadmap |
| Slim Phase 4/5 edge-case tests to happy-path + authz | Low risk; **keep the parametrized 403 RBAC matrix** (named deliverable) |
| Frontend integration → backend-only demo | Fast; touches Vanshika's ownership — needs her buy-in |
| Membership richness → minimal join/approve | Medium; FR-02 still satisfied |

**Never cut:** auth/RBAC (foundation), synchronous audit-in-transaction (Phase 5
differentiator), registration capacity/deadline/duplicate integrity (FR-04, most likely
reviewer probe).

### Day-band plan — branch 1: sufficient capacity `[UNCONFIRMED]`

| Dates | Focus |
| --- | --- |
| 18–19 Oct | Record 3 gap decisions; Phase 1 scaffold, settings, `/health`, SQLAlchemy layer, OpenAPI export script → hand contract to Vanshika |
| 19–21 Oct | Phase 2: JWT auth, 5-role RBAC, parametrized 403-denial matrix tests |
| 21–23 Oct | Phase 3 clubs/memberships + Phase 4 events/registration (overlap once contract is solid) |
| 23–25 Oct | Phase 5 approvals + synchronous audit + transactional rollback tests |
| 25–27 Oct | End-to-end hardening, synthetic seed data, demo path, docs, tag `mid-review-v1` |
| 28 Oct | Mid Review |

### Day-band plan — branch 2: part-time capacity (~2–3 h/day) `[UNCONFIRMED]`

Phases 1–5 as written do not fit (~20–30 h). Honest target = vertical slice:
Phases 1–2 solid → minimal Phase 3 read → Phase 4 core registration → Phase 5
proposal-approval-only. Membership richness, outcomes, and edge-case tests deferred.
Reviewer scope conversation becomes mandatory.

## Routing

- Decisions (once confirmed): `.planning/STATE.md` → add-decision entries.
- If scope changes are agreed: `.planning/ROADMAP.md` phase edits + `.planning/REQUIREMENTS.md`.
- Next actions for the team: confirm open questions 1–6, then execute `/gsd-plan-phase 1`.
