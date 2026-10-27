import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../lib/api'
import type { Paginated, Proposal } from '../lib/types'
import { formatDate } from '../lib/format'
import ProgramSelector from '../components/ProgramSelector'
import {
  EmptyState,
  ErrorNote,
  PageHeader,
  Spinner,
  StatusBadge,
  SuccessNote,
} from '../components/ui'

const DESCRIPTION_MIN = 10

export default function ApplyClubPage() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loadingProposals, setLoadingProposals] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [proposedName, setProposedName] = useState('')
  const [branchId, setBranchId] = useState('')
  const [programId, setProgramId] = useState('')
  const [description, setDescription] = useState('')

  // Fetches proposals on demand (used after a submit). Loading is set by callers.
  const fetchProposals = useCallback(async () => {
    try {
      const res = await api.get<Paginated<Proposal>>('/proposals?page=1&page_size=50')
      setProposals(res.items)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your proposals.')
    } finally {
      setLoadingProposals(false)
    }
  }, [])

  // Initial load, isolated from fetchProposals so setState stays out of the effect body.
  useEffect(() => {
    let cancelled = false
    api
      .get<Paginated<Proposal>>('/proposals?page=1&page_size=50')
      .then((res) => {
        if (!cancelled) {
          setProposals(res.items)
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load your proposals.')
      })
      .finally(() => {
        if (!cancelled) setLoadingProposals(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSuccess(null)
    setError(null)

    if (!programId) {
      setError('Please choose the program your club will belong to.')
      return
    }
    if (description.trim().length < DESCRIPTION_MIN) {
      setError(`Please provide a description of at least ${DESCRIPTION_MIN} characters.`)
      return
    }

    setSubmitting(true)
    try {
      const created = await api.post<Proposal>('/proposals', {
        proposed_name: proposedName.trim(),
        program_id: Number(programId),
        description: description.trim(),
      })
      setSuccess(
        `Proposal #${created.proposal_id} for “${created.proposed_name}” was submitted for Faculty review.`,
      )
      setProposedName('')
      setBranchId('')
      setProgramId('')
      setDescription('')
      setLoadingProposals(true)
      await fetchProposals()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit your proposal.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClasses =
    'w-full rounded-xl border border-rose/30 bg-white min-h-11 px-4 py-2.5 text-sm text-bean placeholder-rose outline-none transition focus:border-blood focus:ring-2 focus:ring-blood/20'

  return (
    <div>
      <PageHeader
        title="Apply for club"
        icon="📝"
        subtitle="Propose a new student organisation. The proposal is reviewed in two stages — a Faculty Advisor recommendation, then final approval by the Head of Department, which charts the club automatically."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Submission form */}
        <section className="h-fit rounded-2xl border border-rose/30 bg-white p-6">
          <h2 className="text-base font-bold text-bean">New club proposal</h2>
          <p className="mt-1 text-xs text-olive">
            Fields marked required must be completed before submitting.
          </p>

          <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-4">
            <div>
              <label htmlFor="proposed-name" className="mb-1.5 block text-xs font-medium text-olive">
                Proposed club name <span className="text-blood">*</span>
              </label>
              <input
                id="proposed-name"
                type="text"
                required
                minLength={2}
                maxLength={150}
                value={proposedName}
                onChange={(e) => setProposedName(e.target.value)}
                placeholder="Robotics & Automation Society"
                className={inputClasses}
              />
            </div>

            <ProgramSelector
              branchId={branchId}
              programId={programId}
              onBranchChange={setBranchId}
              onProgramChange={setProgramId}
              required
            />

            <div>
              <label htmlFor="description" className="mb-1.5 block text-xs font-medium text-olive">
                Purpose &amp; activities <span className="text-blood">*</span>
              </label>
              <textarea
                id="description"
                required
                minLength={DESCRIPTION_MIN}
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the club's mission, the activities it will run, and the students it aims to serve."
                className={`${inputClasses} resize-y`}
              />
              <p className="mt-1 text-right text-[11px] text-olive">
                {description.trim().length}/{DESCRIPTION_MIN} characters minimum
              </p>
            </div>

            {success && <SuccessNote message={success} />}
            {error && <ErrorNote message={error} />}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-vanilla px-4 py-2.5 text-sm font-semibold text-bean shadow-lg shadow-blood/20 transition hover:hover:disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Submitting…' : 'Submit proposal'}
            </button>
          </form>
        </section>

        {/* Status of previously submitted proposals */}
        <section>
          <h2 className="text-base font-bold text-bean">Your proposals</h2>
          <p className="mt-1 text-xs text-olive">
            Approval history for every club you have proposed.
          </p>

          <div className="mt-5 space-y-4">
            {loadingProposals ? (
              <Spinner label="Loading proposals" />
            ) : proposals.length === 0 ? (
              <EmptyState
                title="No proposals yet"
                hint="Submit the form to start your first club proposal."
              />
            ) : (
              proposals.map((proposal) => (
                <article
                  key={proposal.proposal_id}
                  className="rounded-2xl border border-rose/30 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-bean">{proposal.proposed_name}</h3>
                      <p className="mt-0.5 text-xs text-olive">
                        {proposal.program_name ?? 'Unknown program'} • Submitted{' '}
                        {formatDate(proposal.submitted_at)}
                      </p>
                    </div>
                    <StatusBadge status={proposal.status} />
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-olive">{proposal.description}</p>

                  {proposal.approvals.length > 0 ? (
                    <ol className="mt-4 space-y-2 border-t border-rose/30 pt-4">
                      {proposal.approvals.map((approval) => (
                        <li key={approval.approval_id} className="text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold uppercase tracking-wide text-bean">
                              {approval.stage}
                            </span>
                            <StatusBadge status={approval.decision === 'approve' ? 'approved' : approval.decision} />
                            <span className="text-olive">
                              by {approval.reviewer_name ?? 'Reviewer'} on {formatDate(approval.decided_at)}
                            </span>
                          </div>
                          {approval.comment && (
                            <p className="mt-1 rounded-lg bg-white px-3 py-2 text-olive">
                              “{approval.comment}”
                            </p>
                          )}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-4 border-t border-rose/30 pt-4 text-xs text-olive">
                      Awaiting first review by a Faculty Advisor.
                    </p>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
