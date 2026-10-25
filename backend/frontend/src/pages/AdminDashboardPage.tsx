import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { AnalyticsOverview, AuditLog, Paginated, Proposal } from '../lib/types'
import { formatDate } from '../lib/format'
import { useAuth } from '../lib/auth'
import {
  EmptyState,
  ErrorNote,
  PageHeader,
  Spinner,
  StatusBadge,
  SuccessNote,
} from '../components/ui'

/** Roles permitted to view institutional analytics (`/admin/analytics/overview`). */
const CAN_VIEW_ANALYTICS = new Set(['Administrator', 'HOD'])
/** Roles permitted to view the audit trail (`/admin/audit-logs`). */
const CAN_VIEW_AUDIT = new Set(['Administrator'])
/** Roles permitted to decide on club applications. Administrator and HOD decisions are final. */
const CAN_REVIEW = new Set(['Administrator', 'HOD'])

type Decision = 'approve' | 'reject' | 'changes_requested'

const STATUS_TABS: { key: string; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'changes_requested', label: 'Changes requested' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string | number
  hint?: string
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold ${accent}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

function ProposalCard({
  proposal,
  canReview,
  reviewing,
  reviewError,
  comment,
  onCommentChange,
  onReview,
}: {
  proposal: Proposal
  canReview: boolean
  reviewing: boolean
  reviewError?: string | null
  comment: string
  onCommentChange: (value: string) => void
  onReview: (decision: Decision) => void
}) {
  // Only proposals still in the review pipeline can be decided.
  const actionable = canReview && (proposal.status === 'submitted' || proposal.status === 'changes_requested')

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">{proposal.proposed_name}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            by <span className="font-medium text-slate-400">{proposal.applicant_name ?? 'Unknown applicant'}</span>
            {' • '}
            {proposal.program_name ?? 'Unknown program'}
            {proposal.branch_name && ` (${proposal.branch_name})`}
          </p>
        </div>
        <StatusBadge status={proposal.status} />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-400">{proposal.description}</p>

      <p className="mt-2 text-[11px] text-slate-500">Submitted {formatDate(proposal.submitted_at)}</p>

      {proposal.approvals.length > 0 ? (
        <ol className="mt-4 space-y-2 border-t border-slate-800 pt-4">
          {proposal.approvals.map((approval) => (
            <li key={approval.approval_id} className="text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold uppercase tracking-wide text-slate-300">{approval.stage}</span>
                <StatusBadge status={approval.decision === 'approve' ? 'approved' : approval.decision} />
                <span className="text-slate-500">
                  by {approval.reviewer_name ?? 'Reviewer'} on {formatDate(approval.decided_at)}
                </span>
              </div>
              {approval.comment && (
                <p className="mt-1 rounded-lg bg-slate-950/70 px-3 py-2 text-slate-400">“{approval.comment}”</p>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 border-t border-slate-800 pt-4 text-xs text-slate-500">
          Awaiting first review by a Faculty Advisor.
        </p>
      )}

      {actionable && (
        <div className="mt-4 border-t border-slate-800 pt-4">
          <label
            htmlFor={`review-comment-${proposal.proposal_id}`}
            className="mb-1.5 block text-xs font-medium text-slate-400"
          >
            Reviewer comment <span className="text-slate-600">(required to reject or request changes)</span>
          </label>
          <textarea
            id={`review-comment-${proposal.proposal_id}`}
            rows={2}
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Add your reasoning for the applicant…"
            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-white placeholder-slate-600 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={reviewing}
              onClick={() => onReview('approve')}
              className="rounded-xl bg-emerald-600/90 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {reviewing ? 'Recording…' : 'Approve & charter club'}
            </button>
            <button
              type="button"
              disabled={reviewing}
              onClick={() => onReview('changes_requested')}
              className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              Request changes
            </button>
            <button
              type="button"
              disabled={reviewing}
              onClick={() => onReview('reject')}
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              Reject
            </button>
          </div>
          {reviewError && <div className="mt-3">
            <ErrorNote message={reviewError} />
          </div>}
        </div>
      )}
    </article>
  )
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const role = user?.role ?? ''

  const canViewAnalytics = CAN_VIEW_ANALYTICS.has(role)
  const canViewAudit = CAN_VIEW_AUDIT.has(role)
  const canReview = CAN_REVIEW.has(role)

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(canViewAnalytics)

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditError, setAuditError] = useState<string | null>(null)
  const [loadingAudit, setLoadingAudit] = useState(canViewAudit)

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [proposalsTotal, setProposalsTotal] = useState(0)
  const [proposalsError, setProposalsError] = useState<string | null>(null)
  const [loadingProposals, setLoadingProposals] = useState(canViewAnalytics)
  const [statusFilter, setStatusFilter] = useState('')

  const [reviewingId, setReviewingId] = useState<number | null>(null)
  const [reviewErrors, setReviewErrors] = useState<Record<number, string | null>>({})
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<number, string>>({})

  useEffect(() => {
    if (!canViewAnalytics) return
    api
      .get<AnalyticsOverview>('/admin/analytics/overview')
      .then((res) => {
        setOverview(res)
        setAnalyticsError(null)
      })
      .catch((err: unknown) =>
        setAnalyticsError(err instanceof Error ? err.message : 'Failed to load analytics.'),
      )
      .finally(() => setLoadingAnalytics(false))
  }, [canViewAnalytics])

  useEffect(() => {
    if (!canViewAudit) return
    api
      .get<Paginated<AuditLog>>('/admin/audit-logs?page=1&page_size=25')
      .then((res) => {
        setAuditLogs(res.items)
        setAuditError(null)
      })
      .catch((err: unknown) =>
        setAuditError(err instanceof Error ? err.message : 'Failed to load audit logs.'),
      )
      .finally(() => setLoadingAudit(false))
  }, [canViewAudit])

  useEffect(() => {
    if (!canViewAnalytics) return
    let cancelled = false
    const query = statusFilter ? `&status=${statusFilter}` : ''
    api
      .get<Paginated<Proposal>>(`/proposals?page=1&page_size=50${query}`)
      .then((res) => {
        if (!cancelled) {
          setProposals(res.items)
          setProposalsTotal(res.total)
          setProposalsError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setProposalsError(err instanceof Error ? err.message : 'Failed to load club applications.')
      })
      .finally(() => {
        if (!cancelled) setLoadingProposals(false)
      })
    return () => {
      cancelled = true
    }
  }, [canViewAnalytics, statusFilter])

  // Re-fetch helpers used after a review decision is recorded.
  const refreshProposals = useCallback(async () => {
    const query = statusFilter ? `&status=${statusFilter}` : ''
    const res = await api.get<Paginated<Proposal>>(`/proposals?page=1&page_size=50${query}`)
    setProposals(res.items)
    setProposalsTotal(res.total)
  }, [statusFilter])

  const refreshOverview = useCallback(async () => {
    const res = await api.get<AnalyticsOverview>('/admin/analytics/overview')
    setOverview(res)
  }, [])

  async function handleReview(proposal: Proposal, decision: Decision) {
    const comment = (comments[proposal.proposal_id] ?? '').trim()

    // Mirror the backend rule: reject / changes_requested demand a comment.
    if (decision !== 'approve' && !comment) {
      setReviewErrors((prev) => ({
        ...prev,
        [proposal.proposal_id]: 'A comment is required when rejecting or requesting changes.',
      }))
      return
    }

    setReviewingId(proposal.proposal_id)
    setReviewErrors((prev) => ({ ...prev, [proposal.proposal_id]: null }))
    setReviewSuccess(null)
    try {
      await api.post<Proposal>(`/proposals/${proposal.proposal_id}/review`, {
        decision,
        comment: comment || null,
      })
      setReviewSuccess(
        decision === 'approve'
          ? `“${proposal.proposed_name}” was approved — the club is now chartered and its applicant appointed Lead.`
          : decision === 'reject'
            ? `“${proposal.proposed_name}” was rejected. The applicant has been notified.`
            : `Changes were requested on “${proposal.proposed_name}”. The applicant has been notified.`,
      )
      setComments((prev) => ({ ...prev, [proposal.proposal_id]: '' }))
      // Approving changes club counts and pending totals — refresh both panels.
      await Promise.all([refreshProposals(), refreshOverview()])
    } catch (err) {
      setReviewErrors((prev) => ({
        ...prev,
        [proposal.proposal_id]: err instanceof Error ? err.message : 'Failed to record the decision.',
      }))
    } finally {
      setReviewingId(null)
    }
  }

  function handleTabChange(key: string) {
    // Loading is toggled here (event handler) so the effect body stays setState-free.
    setLoadingProposals(true)
    setStatusFilter(key)
  }

  if (!canViewAnalytics) {
    return (
      <div>
        <PageHeader title="Admin Dashboard" icon="🛡️" subtitle="Institution-wide governance and analytics." />
        <EmptyState
          title="Administrator or Head of Department access required"
          hint={`You are signed in as ${role || 'an unprivileged user'}. Contact an administrator if you believe this is wrong.`}
        />
      </div>
    )
  }

  const attendanceRate = overview ? Math.round(overview.avg_attendance_rate * 100) : 0

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        icon="🛡️"
        subtitle="Institution-wide governance and analytics, calculated live from database records."
      />

      {loadingAnalytics && <Spinner label="Loading analytics" />}
      {analyticsError && <ErrorNote message={analyticsError} />}

      {overview && !loadingAnalytics && (
        <>
          {/* Headline metrics */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Active clubs"
              value={overview.active_clubs}
              hint={`${overview.total_clubs} chartered in total`}
              accent="text-violet-300"
            />
            <StatCard
              label="Pending proposals"
              value={overview.pending_proposals}
              hint="Awaiting Faculty or HOD review"
              accent={overview.pending_proposals > 0 ? 'text-amber-300' : 'text-slate-300'}
            />
            <StatCard
              label="Published events"
              value={overview.published_events}
              hint={`${overview.total_events} events on record`}
              accent="text-cyan-300"
            />
            <StatCard
              label="Students"
              value={overview.total_students}
              hint="Registered student accounts"
              accent="text-indigo-300"
            />
          </div>

          {/* Secondary metrics */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Confirmed registrations"
              value={overview.confirmed_registrations}
              hint={`${overview.total_registrations} total registration attempts`}
              accent="text-white"
            />
            <StatCard
              label="Attendance recorded"
              value={overview.total_attendance}
              hint="Verified attendance marks"
              accent="text-white"
            />
            <StatCard
              label="Avg attendance rate"
              value={`${attendanceRate}%`}
              hint="Attendance ÷ confirmed registrations"
              accent={attendanceRate >= 60 ? 'text-emerald-300' : 'text-amber-300'}
            />
          </div>
        </>
      )}

      {/* Club applications — proposal pipeline with review actions */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">Club applications</h2>
            <p className="mt-1 text-xs text-slate-400">
              Proposals to open new clubs.
              {canReview
                ? ' Your approval is final — it charts the club immediately and appoints the applicant as its Lead.'
                : ' Decisions are recorded by Faculty Advisors and the Head of Department.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  statusFilter === tab.key
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                    : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {reviewSuccess && (
          <div className="mt-4">
            <SuccessNote message={reviewSuccess} />
          </div>
        )}
        {proposalsError && <div className="mt-4">
          <ErrorNote message={proposalsError} />
        </div>}
        {loadingProposals && (
          <div className="mt-4">
            <Spinner label="Loading applications" />
          </div>
        )}

        {!loadingProposals && !proposalsError && proposals.length === 0 && (
          <div className="mt-4">
            <EmptyState
              title={statusFilter ? 'No applications with this status' : 'No club applications yet'}
              hint={
                statusFilter
                  ? 'Try a different filter to see other applications.'
                  : 'Applications submitted through “Apply for club” will appear here.'
              }
            />
          </div>
        )}

        {!loadingProposals && proposals.length > 0 && (
          <p className="mt-4 text-[11px] uppercase tracking-wider text-slate-500">
            Showing {proposals.length} of {proposalsTotal} application{proposalsTotal === 1 ? '' : 's'}
          </p>
        )}

        <div className="mt-3 space-y-4">
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.proposal_id}
              proposal={proposal}
              canReview={canReview}
              reviewing={reviewingId === proposal.proposal_id}
              reviewError={reviewErrors[proposal.proposal_id]}
              comment={comments[proposal.proposal_id] ?? ''}
              onCommentChange={(value) =>
                setComments((prev) => ({ ...prev, [proposal.proposal_id]: value }))
              }
              onReview={(decision) => void handleReview(proposal, decision)}
            />
          ))}
        </div>
      </section>

      {/* Branch breakdown */}
      {overview && !loadingAnalytics && (
        <section className="mt-10">
          <h2 className="text-base font-bold text-white">Branch breakdown</h2>
          <p className="mt-1 text-xs text-slate-400">
            Club, event, and registration activity grouped by master branch (e.g. B.Tech, M.Tech).
          </p>

          {overview.branch_metrics.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No branches recorded" />
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Branch</th>
                    <th className="px-4 py-3 font-medium">Active clubs</th>
                    <th className="px-4 py-3 font-medium">Events hosted</th>
                    <th className="px-4 py-3 font-medium">Registrations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {overview.branch_metrics.map((branch) => (
                    <tr key={branch.branch_id} className="bg-slate-950/40">
                      <td className="px-4 py-3 font-medium text-white">{branch.branch_name}</td>
                      <td className="px-4 py-3 text-slate-300">{branch.active_clubs}</td>
                      <td className="px-4 py-3 text-slate-300">{branch.events_hosted}</td>
                      <td className="px-4 py-3 text-slate-300">{branch.total_registrations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Audit trail — Administrator only */}
      {canViewAudit && (
        <section className="mt-10">
          <h2 className="text-base font-bold text-white">Recent audit activity</h2>
          <p className="mt-1 text-xs text-slate-400">
            Immutable record of sensitive operations — the last 25 entries.
          </p>

          <div className="mt-4 space-y-2">
            {loadingAudit && <Spinner label="Loading audit logs" />}
            {auditError && <ErrorNote message={auditError} />}
            {!loadingAudit && !auditError && auditLogs.length === 0 && (
              <EmptyState title="No audit entries yet" hint="Sensitive operations will appear here." />
            )}

            {auditLogs.map((log) => (
              <div
                key={log.audit_log_id}
                className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-violet-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-violet-300">
                      {log.action}
                    </span>
                    <span className="text-xs text-slate-500">
                      {log.entity_type} #{log.entity_id}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{formatDate(log.created_at)}</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  by <span className="font-medium text-slate-300">{log.actor_name ?? 'Unknown'}</span>
                  {log.actor_email && <span className="text-slate-500"> ({log.actor_email})</span>}
                </p>
                {log.details && (
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950/70 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
                    {log.details}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
