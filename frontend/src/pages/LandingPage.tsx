import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ScrollFilm from '../components/scrollfilm/ScrollFilm'
import { useReveal } from '../components/scrollfilm/useReveal'

/** A rendered film still; degrades to a gradient plate if the file is missing. */
function Still({ name, alt }: { name: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <figure className="still" data-reveal>
      {!failed && (
        <img src={`/film/${name}.webp`} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      )}
    </figure>
  )
}

const SPECS: Array<[string, string]> = [
  ['Interface', 'React 19 · TypeScript · Tailwind 4 · Vite'],
  ['Service', 'FastAPI (Python 3.11+) · Pydantic schemas'],
  ['Data', 'SQLite for dev — SQLAlchemy models, Postgres-ready'],
  ['Access', 'JWT sessions · five role tiers · server-side RBAC'],
  ['Workflow', 'Faculty recommendation → HOD final approval'],
  ['Records', 'Immutable audit trail on every mutation'],
  ['Files', 'Local storage or Azure Blob'],
  ['Contract', 'OpenAPI-first — live docs at /docs'],
]

const STATS: Array<[string, string]> = [
  ['22', 'branches mapped'],
  ['59', 'programs covered'],
  ['5', 'role tiers enforced'],
  ['52', 'tests, green'],
]

const VOICES: Array<[string, string]> = [
  ['“Proposals that took three follow-ups now take one signature.”', 'Faculty advisor, B.Tech'],
  ['“Every club’s events, finally on one calendar.”', 'Club manager, Robotics Society'],
  ['“Audit week stopped being a search party.”', 'Program office'],
]

const NAV_LINKS: { href: string; label: string }[] = [
  { href: '#manifesto', label: 'Overview' },
  { href: '#origin', label: 'Workflow' },
  { href: '#numbers', label: 'Numbers' },
  { href: '#voices', label: 'Voices' },
]

function BrandMark({ size = 'md' }: { size?: 'md' | 'sm' }) {
  const box = size === 'md' ? 'h-9 w-9' : 'h-8 w-8'
  const inner = size === 'md' ? 'rounded-[11px] text-sm' : 'rounded-[9px] text-xs'
  return (
    <div className={`${box} shrink-0 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px]`}>
      <div className={`flex h-full w-full items-center justify-center ${inner} bg-slate-950 font-black text-transparent bg-clip-text bg-gradient-to-tr from-violet-400 to-cyan-300`}>
        CS
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [navVisible, setNavVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  useReveal(rootRef)

  // Always open the film at frame zero, never resumed mid-scroll.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Stable callback — ScrollFilm builds its scene once on mount.
  const handleFilmEnd = useCallback((ended: boolean) => {
    setNavVisible(ended)
    if (!ended) setMenuOpen(false)
  }, [])

  // Escape dismisses the compact nav menu.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <div ref={rootRef} className="landing">
      {/* Sticky nav — appears once the film ends */}
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#05050a]/80 backdrop-blur-md transition-transform duration-500 ${
          navVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-2 px-4 pt-[env(safe-area-inset-top)] sm:px-6">
          <a href="#film-top" className="flex min-w-0 items-center gap-3">
            <BrandMark size="sm" />
            <span className="truncate bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-lg font-bold text-transparent">
              ClubSphere
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-slate-400 sm:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} className="transition hover:text-white" href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/login"
              className="rounded-full border border-violet-500/60 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 sm:px-5"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="landing-mobile-menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:border-slate-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 cursor-pointer sm:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Phones: the section links are hidden above `sm`, so surface them here. */}
        <div
          id="landing-mobile-menu"
          className={`overflow-hidden border-t border-white/5 transition-[max-height,opacity] duration-300 sm:hidden ${
            menuOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="mx-auto flex max-w-6xl flex-col px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <span id="film-top" />

      {/* ── the film ─────────────────────────────────────── */}
      <ScrollFilm onFilmEnd={handleFilmEnd} />

      {/* ── brand page ───────────────────────────────────── */}
      <main className="relative z-10 bg-[#05050a]">
        {/* Manifesto */}
        <section id="manifesto" className="mx-auto max-w-5xl scroll-mt-24 px-5 py-24 text-center sm:px-6 sm:py-40">
          <h2 data-reveal className="display-xl text-white">
            Every club deserves an <span className="text-violet-400">operating system.</span>
          </h2>
          <p data-reveal className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:mt-8 sm:text-lg">
            Clubs form, propose, approve, meet, audit. ClubSphere is the single
            orbit all of it shares.
          </p>
        </section>

        {/* Origin */}
        <section id="origin" className="scroll-mt-24 border-t border-white/5">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:gap-14 sm:px-6 sm:py-28 md:grid-cols-2">
            <div data-reveal>
              <p className="eyebrow">Origin</p>
              <h2 className="display-lg text-white">Why the sphere exists</h2>
              <p className="mt-6 leading-relaxed text-slate-400">
                Clubs run on paper forms, chat threads and memory. Proposals
                stall between desks; audits reconstruct history from
                screenshots.
              </p>
              <p className="mt-4 leading-relaxed text-slate-400">
                ClubSphere models the real chain — student proposal, faculty
                recommendation, HOD approval, club born with its manager
                already assigned.
              </p>
            </div>
            <Still name="still-origin" alt="The ClubSphere core, rendered at the ignition chapter" />
          </div>
        </section>

        {/* Craft chapters */}
        <section id="craft" className="scroll-mt-24 border-t border-white/5">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="grid items-center gap-10 py-14 sm:gap-14 sm:py-24 md:grid-cols-2">
              <Still name="still-approvals" alt="Meridian lines drawing across the sphere" />
              <div data-reveal>
                <p className="eyebrow">Approvals</p>
                <h2 className="display-lg text-white">Approvals that can’t get lost.</h2>
                <p className="mt-6 leading-relaxed text-slate-400">
                  Faculty recommends. The Head of Department gives final
                  approval. The club appears instantly, roles assigned —
                  nothing to retype, nothing to chase.
                </p>
              </div>
            </div>

            <div className="grid items-center gap-10 py-14 sm:gap-14 sm:py-24 md:grid-cols-2">
              <div data-reveal className="md:order-1">
                <p className="eyebrow">Attendance</p>
                <h2 className="display-lg text-white">Attendance that proves itself.</h2>
                <p className="mt-6 leading-relaxed text-slate-400">
                  Registrations, check-ins and notifications ride one wire from
                  event to record. Every mutation lands in an audit trail
                  nobody can rewrite.
                </p>
              </div>
              <Still name="still-attendance" alt="The member constellation with event pulses" />
            </div>

            <div className="grid items-center gap-10 py-14 sm:gap-14 sm:py-24 md:grid-cols-2">
              <Still name="still-programs" alt="The compliance shell assembling around the sphere" />
              <div data-reveal>
                <p className="eyebrow">Academics</p>
                <h2 className="display-lg text-white">One grid, every program.</h2>
                <p className="mt-6 leading-relaxed text-slate-400">
                  Twenty-two branches, fifty-nine programs — partner-backed
                  tracks included — drive every dropdown from registration to
                  proposal. Pick your program once; the platform knows your
                  world.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Numbers */}
        <section id="numbers" className="scroll-mt-24 border-t border-white/5">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-16 sm:gap-10 sm:px-6 sm:py-28 md:grid-cols-4">
            {STATS.map(([n, label]) => (
              <div key={label} data-reveal className="text-center">
                <div className="stat-num bg-gradient-to-br from-violet-300 to-cyan-200 bg-clip-text text-transparent">
                  {n}
                </div>
                <p className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Specifications */}
        <section id="specs" className="scroll-mt-24 border-t border-white/5">
          <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6 sm:py-28">
            <h2 data-reveal className="display-lg mb-10 text-center text-white sm:mb-12">
              Specifications
            </h2>
            <dl data-reveal className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.02]">
              {SPECS.map(([k, v]) => (
                <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-6 sm:px-6">
                  <dt className="text-sm uppercase tracking-[0.16em] text-slate-500">{k}</dt>
                  <dd className="text-sm text-slate-300 sm:col-span-2">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Voices */}
        <section id="voices" className="scroll-mt-24 border-t border-white/5">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:gap-10 sm:px-6 sm:py-28 md:grid-cols-3">
            {VOICES.map(([quote, who]) => (
              <blockquote key={who} data-reveal className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
                <p className="text-lg leading-snug text-slate-200">{quote}</p>
                <footer className="mt-5 text-sm text-slate-500">— {who}</footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery" className="scroll-mt-24 border-t border-white/5">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-28">
            <h2 data-reveal className="display-lg mb-10 text-center text-white sm:mb-12">
              Inside the sphere.
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Still name="still-gallery-1" alt="Orbital ring with club nodes" />
              <Still name="still-gallery-2" alt="Core ignition close-up" />
              <Still name="still-gallery-3" alt="Full assembly, finale bloom" />
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-white/5">
          <div className="cta-band mx-auto max-w-4xl px-5 py-20 text-center sm:px-6 sm:py-36">
            <h2 data-reveal className="display-xl text-white">
              One sphere. <span className="text-violet-400">Every activity.</span>
            </h2>
            <p data-reveal className="mx-auto mt-6 max-w-xl text-slate-400">
              The platform is live for campus deployment — governance, events,
              attendance and audits in one system.
            </p>
            <div data-reveal className="mt-10">
              <Link to="/login" className="film-cta pointer-events-auto">
                Enter the platform
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/40">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:gap-12 sm:px-6 sm:py-16 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <BrandMark />
                <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-lg font-bold text-transparent">
                  ClubSphere
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                University club &amp; activity lifecycle management —
                governance to audit, one orbit.
              </p>
            </div>
            <div>
              <h3 className="footer-head">Platform</h3>
              <ul className="footer-list">
                <li><Link to="/login">Clubs</Link></li>
                <li><Link to="/login">Events</Link></li>
                <li><Link to="/login">Join a club</Link></li>
                <li><Link to="/login">Apply to found one</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="footer-head">Workflow</h3>
              <ul className="footer-list">
                <li><a href="#origin">Propose</a></li>
                <li><a href="#craft">Recommend</a></li>
                <li><a href="#craft">Approve</a></li>
                <li><a href="#specs">Audit</a></li>
              </ul>
            </div>
            <div>
              <h3 className="footer-head">Stack</h3>
              <ul className="footer-list">
                <li>React 19 + Vite</li>
                <li>FastAPI + SQLAlchemy</li>
                <li>OpenAPI-first contracts</li>
                <li>JWT + role-based access</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 py-6 text-center text-xs text-slate-600">
            © 2026 ClubSphere · University club &amp; activity lifecycle platform
          </div>
        </footer>
      </main>
    </div>
  )
}
