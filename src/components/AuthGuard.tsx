'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Role } from '@/lib/api'

interface AuthGuardProps {
  roles: Role[]
  children: React.ReactNode
}

export default function AuthGuard({ roles, children }: AuthGuardProps) {
  const { isAuthenticated, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    if (role && !roles.includes(role) && role !== 'ADMIN') {
      const home: Record<string, string> = {
        DOCTOR: '/doctor',
        HOSPITAL: '/hospital',
        USER: '/',
        LAB: '/',
        ADMIN: '/',
      }
      router.replace(home[role] || '/')
    }
  }, [loading, isAuthenticated, role, roles, router])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-warm-gray text-sm">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) return null
  if (role && !roles.includes(role) && role !== 'ADMIN') return null

  return <>{children}</>
}
