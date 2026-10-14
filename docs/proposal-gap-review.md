# ClubSphere Proposal Gap Review

## Purpose

Track differences between the combined project proposal and the revised execution plan/SDD. The repository and user-confirmed project name is ClubSphere. The proposal and older SDD still use CampusConnect; use ClubSphere in new project material and update those source documents when preparing the Design Review package.

| Topic | Proposal | Revised plan / SDD | Current handling | Owner / next action |
| --- | --- | --- | --- | --- |
| Project name | CampusConnect | CampusConnect in the plan and SDD; repository is ClubSphere | Use ClubSphere in new files; align the proposal and SDD title before Design Review. | Vanshika: update; Aryan: review. |
| Database | PostgreSQL recommended; PostgreSQL/MySQL accepted. | Azure SQL / SQL Server is the execution baseline, including T-SQL and Azure SQL milestones. | Use Azure SQL provisionally because the revised plan is the current execution authority. Make the proposal and SDD consistent. | Aryan: validate data-layer fit; both: approve. |
| Cloud provider | Any suitable cloud with managed database. | Azure deployment, Azure SQL, Blob Storage, and Key Vault/host settings. | Azure is the current delivery baseline. | Aryan: confirm feasibility and student access; Vanshika: update diagrams. |
| File/object storage | Optional depending on hosting; proposal documents and event media are examples. | Azure Blob round-trip is a Phase 7 acceptance deliverable. | Required later per the revised plan; defer implementation until Phase 7. | Aryan: API/storage; Vanshika: upload UI and verification. |
| Analytics | SQL dashboards first; warehouse/pipeline is advanced optional work. | Three Power BI dashboards and SQL cross-checks are required for the Security Check milestone. | Keep SQL as the source of truth; Power BI dashboards are a planned later deliverable. Warehouse/ETL remains out of MVP. | Vanshika: dashboard; Aryan: SQL validation. |
| Notifications | In-app and/or email notifications are in the proposal scope. | SDD includes a notification module; the execution schedule does not define delivery as an MVP acceptance item and email integration is optional. | Notification channel and MVP status are unresolved; defer email/calendar until the core MVP is stable. | Both: decide whether in-app notifications are required. |
| Event approval | Administrative workflow mentions review of pending proposals/events. | Defined lifecycle has faculty/HOD approval for club proposals; managers create/publish events. | No distinct event-approval workflow is specified in MVP acceptance. Confirm it is excluded, or add explicit roles, states, and acceptance checks. | Both: confirm scope. |
| Optional algorithms | Search, sorting, priority queue, recommendation/ranking, and graph analysis are discussed. | Search/browse is core; recommendations, Redis, QR attendance, calendar, graph analysis, and warehouse extensions are optional/post-MVP. | Keep basic search/filter in MVP; defer advanced ranking, graph analysis, Redis, and QR attendance. | Both: hold the MVP boundary. |
| Authentication | JWT or secure sessions. | JWT access/refresh and five-role RBAC are specified in the SDD/plan. | Follow the revised plan's JWT/RBAC design unless security review changes it. | Aryan: implementation; Vanshika: frontend flow and independent checks. |
| Event outcomes | Outcomes and reports appear in proposal scope. | Outcomes are in the SDD; the revised plan allows dropping EventOutcomes at Mid Review if behind schedule, then finishing later. | Retain in target scope but use the stated Mid Review fallback if the lifecycle is late. | Both: track against milestone. |

## Immediate questions for the design review

1. Approve Azure SQL as the database and update the proposal's PostgreSQL recommendation.
2. Confirm whether event approvals are outside MVP.
3. Confirm whether in-app notifications are MVP; keep email/calendar optional unless explicitly accepted.
4. Confirm that the revised Azure Blob and Power BI milestone requirements remain feasible with the team's accounts and time.

## Status

Draft prepared by Vanshika for Aryan's review. No disputed requirement is silently treated as an approved change; the Azure implementation choices above are provisional until both partners confirm them.
