'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AuthGuard from '@/components/AuthGuard'
import ScreenHeader from '@/components/ScreenHeader'
import * as api from '@/lib/api'
import type { ProfileResponse } from '@/lib/api'

export default function DoctorDashboardPage() {
  return (
    <AuthGuard roles={['DOCTOR']}>
      <DoctorContent />
    </AuthGuard>
  )
}

function DoctorContent() {
  const { token } = useAuth()
  const [myProfile, setMyProfile] = useState<ProfileResponse | null>(null)
  const [profiles, setProfiles] = useState<ProfileResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    async function load() {
      try {
        const me = await api.getMyProfile(token!)
        if (me.success && me.data) setMyProfile(me.data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [token])

  const displayName = myProfile
    ? `Dr. ${myProfile.firstName} ${myProfile.lastName || ''}`.trim()
    : 'Doctor Dashboard'

  return (
    <div className="flex-1 bg-base">
      <ScreenHeader title={displayName} subtitle="Manage patients and view medical records" />
      <div className="px-6 pb-24 space-y-6">
        {/* Quick Stats */}
        <div className="flex gap-2.5">
          {[
            { icon: '👤', label: 'My Profile', value: myProfile ? 'Active' : '—', color: '#0B5D5A' },
            { icon: '🆘', label: 'Emergency Access', value: 'Public', color: '#B3261E' },
            { icon: '🤖', label: 'AI Analysis', value: 'Available', color: '#0284C7' },
          ].map(stat => (
            <div key={stat.label} className="flex-1 bg-card border border-border rounded-xl p-3.5 flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${stat.color}1A` }}>
                <span className="text-sm">{stat.icon}</span>
              </div>
              <span className="text-xl font-bold text-ink">{stat.value}</span>
              <span className="text-xs text-warm-gray text-center">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Search patients by emergency ID */}
        <section>
          <h2 className="text-base font-semibold text-ink mb-3">🔍 Look Up Patient</h2>
          <p className="text-xs text-warm-gray mb-3">
            Enter a patient&apos;s Emergency ID to view their critical medical information (public, no auth needed).
          </p>
          <PatientLookup />
        </section>

        {/* Medical Records Access */}
        <section>
          <h2 className="text-base font-semibold text-ink mb-3">📄 Recent Medical Records</h2>
          <p className="text-xs text-warm-gray mb-3">
            Access patient medical records by their profile ID.
          </p>
          <RecordsLookup token={token} />
        </section>

        {/* AI Analysis */}
        <section>
          <h2 className="text-base font-semibold text-ink mb-3">🤖 AI Medical Analysis</h2>
          <p className="text-xs text-warm-gray mb-3">
            Analyze patient progress for specific conditions using AI.
          </p>
          <AIAnalysis token={token} />
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-base font-semibold text-ink mb-3">🔔 Notifications</h2>
          <NotificationsPanel token={token} />
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-base font-semibold text-ink mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: '🆘', label: 'Emergency Lookup', href: '/emergency/pat-001' },
              { icon: '🏥', label: 'Hospital View', href: '/hospital' },
              { icon: '👤', label: 'Edit Profile', href: '#' },
              { icon: '🔔', label: 'Notifications', href: '#' },
            ].map(a => (
              <Link
                key={a.label}
                href={a.href}
                className="bg-card border border-border rounded-xl py-3.5 px-5 flex flex-col items-center gap-1.5 hover:border-teal/30 transition-colors"
              >
                <span className="text-lg">{a.icon}</span>
                <span className="text-xs font-medium text-ink">{a.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function PatientLookup() {
  const [emergencyId, setEmergencyId] = useState('')
  const [result, setResult] = useState<api.EmergencyProfileResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLookup() {
    if (!emergencyId.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await api.getEmergencyProfile(emergencyId.trim())
      if (data) setResult(data)
      else setError('No patient found with that Emergency ID')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={emergencyId}
          onChange={e => setEmergencyId(e.target.value)}
          placeholder="Enter Emergency ID (UUID)"
          className="flex-1 px-3 py-2 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal"
          onKeyDown={e => e.key === 'Enter' && handleLookup()}
        />
        <button
          onClick={handleLookup}
          disabled={loading || !emergencyId.trim()}
          className="bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal/90 disabled:opacity-50 transition-colors"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>
      {error && <p className="text-xs text-critical">{error}</p>}
      {result && (
        <div className="bg-teal-light rounded-lg p-3 space-y-1">
          <p className="text-sm font-semibold text-ink">{result.firstName} {result.lastName}</p>
          <p className="text-xs text-warm-gray">Blood: {result.bloodGroup || '—'} · Gender: {result.gender || '—'}</p>
          {result.allergies?.length > 0 && (
            <p className="text-xs text-critical">⚠️ Allergies: {result.allergies.join(', ')}</p>
          )}
          {result.conditions?.length > 0 && (
            <p className="text-xs text-ink">Conditions: {result.conditions.join(', ')}</p>
          )}
          <Link
            href={`/emergency/${result.emergencyId}`}
            className="text-xs text-teal font-medium inline-block mt-1 hover:underline"
          >
            View full emergency profile →
          </Link>
        </div>
      )}
    </div>
  )
}

function RecordsLookup({ token }: { token: string | null }) {
  const [profileId, setProfileId] = useState('')
  const [records, setRecords] = useState<api.MedicalRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLookup() {
    if (!profileId.trim() || !token) return
    setLoading(true)
    setError('')
    setRecords([])
    try {
      const res = await api.getProfileRecords(token, profileId.trim())
      if (res.success && res.data) setRecords(res.data)
      else setError(res.message || 'No records found')
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={profileId}
          onChange={e => setProfileId(e.target.value)}
          placeholder="Profile UUID"
          className="flex-1 px-3 py-2 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal"
          onKeyDown={e => e.key === 'Enter' && handleLookup()}
        />
        <button
          onClick={handleLookup}
          disabled={loading || !profileId.trim()}
          className="bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal/90 disabled:opacity-50 transition-colors"
        >
          {loading ? '...' : 'Fetch'}
        </button>
      </div>
      {error && <p className="text-xs text-critical">{error}</p>}
      {records.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {records.map(r => (
            <div key={r.id} className="bg-subtle rounded-lg p-3 text-xs space-y-0.5">
              <p className="font-semibold text-ink">{r.title}</p>
              <p className="text-warm-gray">{r.type} · {new Date(r.uploadDate).toLocaleDateString()}</p>
              {r.description && <p className="text-ink/70">{r.description}</p>}
              {r.presignedUrl && (
                <a href={r.presignedUrl} target="_blank" rel="noopener noreferrer" className="text-teal font-medium hover:underline">
                  View document →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AIAnalysis({ token }: { token: string | null }) {
  const [profileId, setProfileId] = useState('')
  const [condition, setCondition] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAnalyze() {
    if (!profileId.trim() || !condition.trim() || !token) return
    setLoading(true)
    setResult('')
    try {
      const data = await api.analyzeProgress(token, profileId.trim(), condition.trim())
      setResult(data || 'No analysis available')
    } catch {
      setResult('Error fetching analysis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={profileId}
          onChange={e => setProfileId(e.target.value)}
          placeholder="Profile UUID"
          className="px-3 py-2 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal"
        />
        <input
          type="text"
          value={condition}
          onChange={e => setCondition(e.target.value)}
          placeholder="Condition (e.g. Diabetes)"
          className="px-3 py-2 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal"
        />
      </div>
      <button
        onClick={handleAnalyze}
        disabled={loading || !profileId.trim() || !condition.trim()}
        className="bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal/90 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      {result && (
        <div className="bg-teal-light rounded-lg p-3 text-xs text-ink whitespace-pre-wrap max-h-48 overflow-y-auto">
          {result}
        </div>
      )}
    </div>
  )
}

function NotificationsPanel({ token }: { token: string | null }) {
  const [notifications, setNotifications] = useState<api.Notification[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    api.getNotifications(token).then(data => {
      setNotifications(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [token])

  if (loading) return <p className="text-xs text-warm-gray">Loading...</p>

  if (notifications.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 text-center">
        <p className="text-xs text-warm-gray">No notifications</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {notifications.slice(0, 5).map(n => (
        <div key={n.id} className={`bg-card border border-border rounded-xl p-3 ${n.read ? 'opacity-60' : ''}`}>
          <p className="text-xs text-ink">{n.message}</p>
          <p className="text-[10px] text-warm-gray mt-1">{new Date(n.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}
