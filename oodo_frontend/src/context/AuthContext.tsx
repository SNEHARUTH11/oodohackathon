import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Role, User } from '../types/auth'

interface AuthContextValue {
  user: User | null
  token: string | null
  role: Role | null
  isAuthenticated: boolean
  login: (payload: { user: User; token?: string }) => void
  logout: () => void
  setUser: (user: User | null) => void
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
      const value = JSON.parse(raw) as { user: User; token?: string }
      setUserState(value.user)
      setToken(value.token ?? null)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const login = ({ user, token }: { user: User; token?: string }) => {
    setUserState(user)
    setToken(token ?? 'mock-token')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token: token ?? 'mock-token' }))
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
    isAuthenticated: Boolean(user),
    login,
    logout,
    setUser: setUserState
  }), [user, token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
