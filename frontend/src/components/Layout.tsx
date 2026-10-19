import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
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
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)

  const initials = (user?.full_name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // While open: lock body scroll, move focus in, trap Tab, close on Escape.
  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = sidebarRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  /** Close the drawer and return focus to the menu button. */
  function closeMenu() {
    setMenuOpen(false)
    menuButtonRef.current?.focus()
  }

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${
      isActive
        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
    }`

  const brand = (
    <>
      <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px]">
        <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-slate-950 text-sm font-black text-transparent bg-clip-text bg-gradient-to-tr from-violet-400 to-cyan-300">
          CS
        </div>
      </div>
      <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-lg font-bold text-transparent">
        ClubSphere
      </span>
    </>
  )

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 text-slate-100 lg:flex-row">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-slate-800/80 bg-slate-950/90 px-3 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="app-sidebar"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-800 text-slate-300 transition hover:border-slate-700 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px]">
            <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-slate-950 text-xs font-black text-transparent bg-clip-text bg-gradient-to-tr from-violet-400 to-cyan-300">
              CS
            </div>
          </div>
          <span className="truncate text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300">
            ClubSphere
          </span>
        </div>
      </header>

      {/* Scrim */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Sidebar / off-canvas drawer */}
      <aside
        id="app-sidebar"
        ref={sidebarRef}
        aria-label="Primary navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur transition-[transform,visibility] duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:w-64 lg:max-w-none lg:translate-x-0 lg:visible ${
          menuOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-5 pt-[env(safe-area-inset-top)]">
          {brand}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 cursor-pointer lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={linkClass}>
              <span aria-hidden className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {ADMIN_ROLES.has(user?.role ?? '') && (
            <>
              <div className="my-3 border-t border-slate-800/80" />
              <NavLink to="/admin" onClick={() => setMenuOpen(false)} className={linkClass}>
                <span aria-hidden className="text-base">🛡️</span>
                Admin Dashboard
              </NavLink>
            </>
          )}
        </nav>

        <div className="border-t border-slate-800/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
            className="mt-3 min-h-11 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-rose-500/40 hover:text-rose-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Routed page content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
