import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import ProgramSelector from '../components/ProgramSelector'
import { ErrorNote } from '../components/ui'

export default function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Where the user was headed before being bounced to login.
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/clubs'
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [branchId, setBranchId] = useState('')
  const [programId, setProgramId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isRegister = mode === 'register'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isRegister) {
        await register({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
          program_id: programId ? Number(programId) : undefined,
        })
        // Land the user on the login view after a successful registration.
        setMode('login')
        setPassword('')
      } else {
        await login(email.trim(), password)
        navigate(redirectTo, { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClasses =
    'w-full rounded-xl border border-slate-700 bg-slate-900 min-h-11 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      </div>

      <Link
        to="/"
        className="absolute top-5 left-5 z-10 text-sm text-slate-500 transition hover:text-slate-300"
      >
        ← ClubSphere home
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/20">
            <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-tr from-violet-300 to-cyan-200">
              CS
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">ClubSphere</h1>
          <p className="mt-2 text-sm text-slate-400">
            University Club &amp; Activity Lifecycle Management Platform
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-950/70 p-1">
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setMode(tab)
                  setError(null)
                }}
                className={`min-h-11 rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${
                  mode === tab ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="full-name" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Full name
                </label>
                <input
                  id="full-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={150}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aryan Chatterjee"
                  className={inputClasses}
                />
              </div>
            )}

            {isRegister && (
              <ProgramSelector
                branchId={branchId}
                programId={programId}
                onBranchChange={setBranchId}
                onProgramChange={setProgramId}
              />
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-400">
                University email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={isRegister ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? 'Minimum 8 characters' : '••••••••'}
                className={inputClasses}
              />
            </div>

            {error && <ErrorNote message={error} />}

            <button
              type="submit"
              disabled={loading}
              className="min-h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
            New accounts start as <span className="text-slate-300">Student</span>. Roles such as Club
            Manager, Faculty Advisor, HOD and Administrator are assigned by an administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
