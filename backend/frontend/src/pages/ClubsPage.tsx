import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Club, Paginated } from '../lib/types'
import { formatDate } from '../lib/format'
import ProgramSelector from '../components/ProgramSelector'
import { EmptyState, ErrorNote, PageHeader, Spinner, StatusBadge } from '../components/ui'

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [search, setSearch] = useState('')
  const [branchId, setBranchId] = useState('')
  const [programId, setProgramId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const timer = window.setTimeout(() => {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({ page: '1', page_size: '50' })
      if (search.trim()) params.set('search', search.trim())
      if (programId) params.set('program_id', programId)
      else if (branchId) params.set('branch_id', branchId)

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
  }, [search, branchId, programId])

  return (
    <div>
      <PageHeader
        title="CLUBS"
        icon="🏛️"
        subtitle="Browse every chartered student organisation at the university, along with its program, faculty manager and current membership."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clubs by name or description…"
          className="w-full rounded-xl border border-slate-700 bg-slate-900 min-h-11 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:max-w-sm"
        />
        <div className="sm:w-96">
          <ProgramSelector
            branchId={branchId}
            programId={programId}
            onBranchChange={setBranchId}
            onProgramChange={setProgramId}
          />
        </div>
      </div>

      {error && <ErrorNote message={error} />}

      {loading ? (
        <Spinner label="Loading clubs" />
      ) : !error && clubs.length === 0 ? (
        <EmptyState
          title="No clubs found"
          hint="Try a different search term, or head to “Apply for club” to propose a new one."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {clubs.map((club) => (
            <article
              key={club.club_id}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-violet-500/40"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-white">{club.name}</h2>
                <StatusBadge status={club.status} />
              </div>

              <p className="mt-1 text-xs font-medium text-violet-300">
                {club.program_name ?? 'Unassigned program'}
              </p>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">
                {club.description?.trim() || 'No description has been provided for this club yet.'}
              </p>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4 text-xs">
                <div>
                  <dt className="text-slate-500">Members</dt>
                  <dd className="mt-0.5 text-base font-semibold text-white">{club.member_count ?? 0}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Chartered</dt>
                  <dd className="mt-0.5 font-medium text-slate-300">{formatDate(club.created_at)}</dd>
                </div>
              </dl>

              <p className="mt-3 text-xs text-slate-500">
                Managed by <span className="font-medium text-slate-300">{club.manager_name ?? '—'}</span>
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
