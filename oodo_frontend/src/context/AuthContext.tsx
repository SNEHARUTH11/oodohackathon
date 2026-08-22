import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Role, User } from '../types/auth'

interface AuthContextValue {
  user: User | null
  token: string | null
  role: Role | null
  isAuthenticated: boolean
  login: (payload: { user: User; token?: string | null; refreshToken?: string | null }) => void
  logout: () => void
  setUser: (user: User | null) => void
}

interface StoredAuthSession {
  user: User | null
  token?: string | null
  refreshToken?: string | null
}

const STORAGE_KEY = 'dayflow-auth'

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const value = JSON.parse(raw) as StoredAuthSession
      setUserState(value.user ?? null)
      setToken(value.token ?? null)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const login = ({ user, token, refreshToken }: { user: User; token?: string | null; refreshToken?: string | null }) => {
    const accessToken = token ?? null
    const session: StoredAuthSession = {
      user,
      token: accessToken,
      refreshToken: refreshToken ?? null
    }

    setUserState(user)
    setToken(accessToken)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }

  const logout = () => {
    setUserState(null)
    setToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    role: user?.role ?? null,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
    setUser: setUserState
  }), [user, token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
