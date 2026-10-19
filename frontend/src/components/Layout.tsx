import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

const NAV_ITEMS: { to: string; label: string; icon: string }[] = [
  { to: '/clubs', label: 'Clubs', icon: '🏛️' },
  { to: '/events', label: 'Events', icon: '📅' },
  { to: '/joinclub', label: 'Join club', icon: '🤝' },
  { to: '/applyclub', label: 'Apply for club', icon: '📝' },
]

/** Roles allowed to see the admin dashboard entry in the sidebar. */
const ADMIN_ROLES = new Set(['Administrator', 'HOD'])

const ROLE_LABEL: Record<string, string> = {
  Student: 'Student',
  'Club Manager': 'Club Manager',
  Faculty: 'Faculty Advisor',
  HOD: 'Head of Department',
  Administrator: 'Administrator',
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = (user?.full_name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/90 backdrop-blur">
        <div className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px]">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-slate-950 text-sm font-black text-transparent bg-clip-text bg-gradient-to-tr from-violet-400 to-cyan-300">
              CS
            </div>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
            ClubSphere
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`
              }
            >
              <span aria-hidden className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {ADMIN_ROLES.has(user?.role ?? '') && (
            <>
              <div className="my-3 border-t border-slate-800/80" />
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <span aria-hidden className="text-base">🛡️</span>
                Admin Dashboard
              </NavLink>
            </>
          )}
        </nav>

        <div className="border-t border-slate-800/80 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.full_name}</p>
              <p className="truncate text-xs text-slate-500">
                {ROLE_LABEL[user?.role ?? ''] ?? user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={() => void handleLogout()}
            className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-rose-500/40 hover:text-rose-300 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Routed page content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
