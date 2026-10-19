import type { ReactNode } from 'react'

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      <span>{label}…</span>
    </div>
  )
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="break-words rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
      {message}
    </div>
  )
}

export function SuccessNote({ message }: { message: string }) {
  return (
    <div className="break-words rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
      {message}
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-14 text-center">
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

const BADGE_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  published: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  approved: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  confirmed: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  requested: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  submitted: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  pending: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  draft: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
  completed: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  changes_requested: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
  cancelled: 'bg-slate-500/10 text-slate-400 border-slate-600/40',
  removed: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  suspended: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
}

export function StatusBadge({ status }: { status: string }) {
  const style = BADGE_STYLES[status] ?? 'bg-slate-500/10 text-slate-300 border-slate-500/30'
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${style}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export function PageHeader({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: ReactNode }) {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/10 text-xl">
            {icon}
          </div>
        )}
        <h1 className="min-w-0 break-words text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
      </div>
      {subtitle && <p className="mt-2 max-w-2xl text-sm text-slate-400">{subtitle}</p>}
    </header>
  )
}
