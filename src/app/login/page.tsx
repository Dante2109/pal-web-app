'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import * as api from '@/lib/api'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, isAuthenticated, role } = useAuth()
  const router = useRouter()

  if (isAuthenticated && role) {
    const home: Record<string, string> = {
      DOCTOR: '/doctor',
      HOSPITAL: '/hospital',
      USER: '/',
      LAB: '/',
      ADMIN: '/',
    }
    router.replace(home[role] || '/')
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!identifier.trim() || !password) {
      setError('Email/mobile and password are required')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.login(identifier.trim(), password)
      if (res.success && res.data) {
        login(res.data.token, res.data.role)
        const home: Record<string, string> = {
          DOCTOR: '/doctor',
          HOSPITAL: '/hospital',
          USER: '/',
          LAB: '/',
          ADMIN: '/',
        }
        router.replace(home[res.data.role] || '/')
      } else {
        setError(res.message || 'Login failed. Check your credentials.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-teal rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
          <p className="text-sm text-warm-gray mt-1">Sign in to PAL</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink block mb-1">Email or Mobile</label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="email@example.com or +91..."
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal transition-colors"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal transition-colors"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-critical-light border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xs text-critical">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal text-white py-3 rounded-xl font-semibold text-sm hover:bg-teal/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-warm-gray text-center mt-8 leading-relaxed">
          Demo accounts are managed by the platform admin.{' '}
          <a href="/" className="text-teal font-medium">Back to home</a>
        </p>
      </div>
    </div>
  )
}
