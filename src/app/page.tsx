'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const { isAuthenticated, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    if (role === 'DOCTOR') router.replace('/doctor')
    else if (role === 'HOSPITAL') router.replace('/hospital')
    else if (role === 'LAB') router.replace('/')
  }, [loading, isAuthenticated, role, router])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-warm-gray text-sm">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-teal rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-3xl font-bold">M</span>
        </div>
        <h1 className="text-3xl font-bold text-ink mb-2">MediGuardian</h1>
        <p className="text-warm-gray text-base leading-relaxed">
          Emergency medical profile system for patients, doctors, and hospitals.
        </p>
      </div>

      <div className="grid gap-4 w-full max-w-sm">
        {role === 'ADMIN' && (
          <>
            <Link href="/doctor" className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-teal/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-light flex items-center justify-center text-xl">🩺</div>
              <div className="flex-1">
                <p className="font-semibold text-ink">Doctor Dashboard</p>
                <p className="text-sm text-warm-gray">Patients, appointments, alerts</p>
              </div>
              <span className="text-warm-gray">→</span>
            </Link>
            <Link href="/hospital" className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-teal/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-light flex items-center justify-center text-xl">🏥</div>
              <div className="flex-1">
                <p className="font-semibold text-ink">Hospital Dashboard</p>
                <p className="text-sm text-warm-gray">Emergency, beds, QR logs</p>
              </div>
              <span className="text-warm-gray">→</span>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
