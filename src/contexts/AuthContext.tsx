'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Role } from '@/lib/api'

interface AuthState {
  token: string | null
  role: Role | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  login: (token: string, role: Role) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY_TOKEN = 'mg_token'
const STORAGE_KEY_ROLE = 'mg_role'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, role: null, loading: true })

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN)
    const role = localStorage.getItem(STORAGE_KEY_ROLE) as Role | null
    setState({ token, role, loading: false })
  }, [])

  const login = useCallback((token: string, role: Role) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, token)
    localStorage.setItem(STORAGE_KEY_ROLE, role)
    setState({ token, role, loading: false })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    localStorage.removeItem(STORAGE_KEY_ROLE)
    setState({ token: null, role: null, loading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isAuthenticated: !!state.token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
