import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { EventItem, Paginated } from '../lib/types'
import { formatDate } from '../lib/format'
import { EmptyState, ErrorNote, PageHeader, Spinner, StatusBadge } from '../components/ui'

type Feedback = { kind: 'success' | 'error'; message: string } | null

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('published')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyEventId, setBusyEventId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<Record<number, Feedback>>({})
  // The API exposes no "my registrations" endpoint for students, so track the
  // registrations confirmed during this session to offer a cancel action.
  const [registeredIds, setRegisteredIds] = useState<Set<number>>(new Set())

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: '1', page_size: '50' })
      if (search.trim()) params.set('search', search.trim())
      if (status) params.set('status', status)
      const res = await api.get<Paginated<EventItem>>(`/events?${params.toString()}`)
      setEvents(res.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events.')
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadEvents(), 300)
    return () => window.clearTimeout(timer)
  }, [loadEvents])

  async function toggleRegistration(event: EventItem) {
    setBusyEventId(event.event_id)
    setFeedback((prev) => ({ ...prev, [event.event_id]: null }))
    const isRegistered = registeredIds.has(event.event_id)
    try {
      if (isRegistered) {
        await api.del(`/events/${event.event_id}/register`)
        setRegisteredIds((prev) => {
          const next = new Set(prev)
          next.delete(event.event_id)
          return next
        })
        setFeedback((prev) => ({
          ...prev,
          [event.event_id]: { kind: 'success', message: 'Your registration was cancelled.' },
        }))
      } else {
        await api.post(`/events/${event.event_id}/register`)
        setRegisteredIds((prev) => new Set(prev).add(event.event_id))
        setFeedback((prev) => ({
          ...prev,
          [event.event_id]: { kind: 'success', message: 'You are registered for this event.' },
        }))
      }
      await loadEvents()
    } catch (err) {
      setFeedback((prev) => ({
        ...prev,
        [event.event_id]: {
          kind: 'error',
          message: err instanceof Error ? err.message : 'Registration failed.',
        },
      }))
    } finally {
      setBusyEventId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Events"
        icon="📅"
        subtitle="Every published club event with live seat availability. Register while seats remain and before the registration deadline."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events by title or venue…"
          className="w-full rounded-xl border border-slate-700 bg-slate-900 min-h-11 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:max-w-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 min-h-11 px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 sm:w-56"
        >
          <option value="published">Published</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {error && <ErrorNote message={error} />}

      {loading ? (
        <Spinner label="Loading events" />
      ) : !error && events.length === 0 ? (
        <EmptyState title="No events found" hint="There are no events matching the current filters." />
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const filled = event.capacity > 0 ? (event.confirmed_registrations / event.capacity) * 100 : 0
            const isFull = event.seats_left <= 0
            const note = feedback[event.event_id]

            return (
              <article
                key={event.event_id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-violet-500/40"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-white">{event.title}</h2>
                      <StatusBadge status={event.status} />
                    </div>
                    <p className="mt-1 text-xs font-medium text-violet-300">
                      Hosted by {event.club_name ?? 'a university club'}
                    </p>

                    <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1 text-xs sm:grid-cols-2">
                      <div className="flex gap-2">
                        <dt className="text-slate-500">Venue:</dt>
                        <dd className="text-slate-300">{event.venue_text || 'To be announced'}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-slate-500">Starts:</dt>
                        <dd className="text-slate-300">{formatDate(event.event_date)}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-slate-500">Register by:</dt>
                        <dd className="text-slate-300">{formatDate(event.registration_deadline)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="shrink-0 sm:text-right">
                    <p className={`text-2xl font-extrabold ${isFull ? 'text-rose-400' : 'text-white'}`}>
                      {event.seats_left}
                    </p>
                    <p className="text-xs text-slate-500">of {event.capacity} seats left</p>
                    <button
                      onClick={() => void toggleRegistration(event)}
                      disabled={
                        busyEventId === event.event_id ||
                        event.status !== 'published' ||
                        (!registeredIds.has(event.event_id) && isFull)
                      }
                      className={`mt-3 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer ${
                        registeredIds.has(event.event_id)
                          ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          : 'bg-violet-600 text-white shadow-violet-500/20 hover:bg-violet-500'
                      }`}
                    >
                      {busyEventId === event.event_id
                        ? 'Working…'
                        : registeredIds.has(event.event_id)
                          ? 'Cancel registration'
                          : isFull
                            ? 'Event full'
                            : 'Register'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${isFull ? 'bg-rose-500' : 'bg-gradient-to-r from-violet-500 to-cyan-400'}`}
                    style={{ width: `${Math.min(100, filled)}%` }}
                  />
                </div>

                {note && (
                  <p
                    className={`mt-3 text-xs font-medium ${note.kind === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}
                  >
                    {note.message}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
