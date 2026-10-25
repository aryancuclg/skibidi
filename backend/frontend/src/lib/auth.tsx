import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AUTH_EXPIRED_EVENT,
  api,
  clearSession,
  getAccessToken,
  readStoredProfile,
  revokeSession,
  saveTokens,
  writeStoredProfile,
} from './api'
import type { SessionProfile, TokenResponse, UserResponse } from './types'

interface RegisterInput {
  full_name: string
  email: string
  password: string
  program_id?: number | null
}

interface AuthContextValue {
  user: SessionProfile | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<UserResponse>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function profileFromToken(tokens: TokenResponse): SessionProfile {
  return {
    user_id: tokens.user_id,
    full_name: tokens.full_name,
    email: tokens.email,
    role: tokens.role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionProfile | null>(() => {
    const stored = readStoredProfile<SessionProfile>()
    return getAccessToken() ? stored : null
  })

  useEffect(() => {
    const onExpired = () => {
      clearSession()
      setUser(null)
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await api.post<TokenResponse>('/auth/login', { email, password })
    saveTokens(tokens)
    const profile = profileFromToken(tokens)
    writeStoredProfile(profile)
    setUser(profile)
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    return api.post<UserResponse>('/auth/register', {
      full_name: input.full_name,
      email: input.email,
      password: input.password,
      ...(input.program_id ? { program_id: input.program_id } : {}),
    })
  }, [])

  const logout = useCallback(async () => {
    await revokeSession()
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, register, logout }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>')
  }
  return ctx
}
