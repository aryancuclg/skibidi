import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Club, Paginated } from '../lib/types'
import { EmptyState, ErrorNote, PageHeader, Spinner, StatusBadge } from '../components/ui'

type JoinState = { kind: 'success' | 'error'; message: string } | null

export default function JoinClubPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyClubId, setBusyClubId] = useState<number | null>(null)
  const [joinState, setJoinState] = useState<Record<number, JoinState>>({})

  useEffect(() => {
    let cancelled = false

    const timer = window.setTimeout(() => {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({ page: '1', page_size: '50', status: 'active' })
      if (search.trim()) params.set('search', search.trim())

      api
        .get<Paginated<Club>>(`/clubs?${params.toString()}`)
        .then((res) => {
          if (cancelled) return
          setClubs(res.items)
          setLoading(false)
        })
        .catch((err: unknown) => {
          if (cancelled) return
          setError(err instanceof Error ? err.message : 'Failed to load clubs.')
          setLoading(false)
        })
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [search])

  async function requestToJoin(club: Club) {
    setBusyClubId(club.club_id)
    setJoinState((prev) => ({ ...prev, [club.club_id]: null }))
    try {
      await api.post(`/clubs/${club.club_id}/join`)
      setJoinState((prev) => ({
        ...prev,
        [club.club_id]: {
          kind: 'success',
          message: `Request sent — the club manager will review your application.`,
        },
      }))
    } catch (err) {
      setJoinState((prev) => ({
        ...prev,
        [club.club_id]: {
          kind: 'error',
          message: err instanceof Error ? err.message : 'Could not submit your request.',
        },
      }))
    } finally {
      setBusyClubId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Join club"
        icon="🤝"
        subtitle="Send a membership request to any active club. Your request goes to the club manager, who approves or rejects it — you will be notified either way."
      />

      <div className="mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search active clubs…"
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:max-w-sm"
        />
      </div>

      {error && <ErrorNote message={error} />}

      {loading ? (
        <Spinner label="Loading clubs" />
      ) : !error && clubs.length === 0 ? (
        <EmptyState
          title="No active clubs available"
          hint="There are no clubs open for membership requests right now."
        />
      ) : (
        <div className="space-y-3">
          {clubs.map((club) => {
            const state = joinState[club.club_id]
            return (
              <div
                key={club.club_id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-violet-500/40"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-base font-bold text-white">{club.name}</h2>
                      <StatusBadge status={club.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {club.program_name ?? 'Unassigned program'} •{' '}
                      {club.member_count ?? 0} member{(club.member_count ?? 0) === 1 ? '' : 's'} • Managed by{' '}
                      <span className="font-medium text-slate-300">{club.manager_name ?? '—'}</span>
                    </p>
                    {club.description?.trim() && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{club.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => void requestToJoin(club)}
                    disabled={busyClubId === club.club_id}
                    className="shrink-0 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-violet-500/20 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    {busyClubId === club.club_id ? 'Sending…' : 'Request to join'}
                  </button>
                </div>

                {state && (
                  <p
                    className={`mt-3 text-xs font-medium ${state.kind === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}
                  >
                    {state.message}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
