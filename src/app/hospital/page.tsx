'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AuthGuard from '@/components/AuthGuard'
import ScreenHeader from '@/components/ScreenHeader'
import * as api from '@/lib/api'
import type { ProfileResponse } from '@/lib/api'

export default function HospitalDashboardPage() {
  return (
    <AuthGuard roles={['HOSPITAL']}>
      <HospitalContent />
    </AuthGuard>
  )
}

function HospitalContent() {
  const { token } = useAuth()
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    api.getMyProfile(token).then(r => {
      if (r.success && r.data) setProfile(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [token])

  return (
    <div className="flex-1 bg-base">
      <ScreenHeader
        title={profile ? `${profile.firstName} ${profile.lastName || ''}` : 'Hospital Dashboard'}
        subtitle="Emergency department management"
      />
      <div className="px-6 pb-24 space-y-6">

        {/* Stats Row */}
        <div className="flex gap-2.5">
          {[
            { icon: '👤', label: 'Profile', value: profile ? 'Active' : 'Setup needed', color: '#0B5D5A' },
            { icon: '🆘', label: 'Emergency ID', value: profile?.emergencyId?.slice(0, 8) || '—', color: '#B3261E' },
            { icon: '🩻', label: 'QR Code', value: profile ? 'Available' : '—', color: '#7C3AED' },
          ].map(stat => (
            <div key={stat.label} className="flex-1 bg-card border border-border rounded-xl p-3.5 flex flex-col items-center gap-1.5">
              <span className="text-ink text-xl font-bold truncate max-w-full text-xs">{stat.value}</span>
              <span className="text-xs text-warm-gray text-center">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Search Patient by Mobile */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔍</span>
            <h2 className="text-base font-semibold text-ink">Search Patient</h2>
          </div>
          <PatientSearch token={token} />
        </section>

        {/* QR Scan History */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📱</span>
            <h2 className="text-base font-semibold text-ink">QR Scan History</h2>
          </div>
          <ScanHistoryPanel token={token} />
        </section>

        {/* Emergency Lookup */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🆘</span>
            <h2 className="text-base font-semibold text-ink">Emergency Profile Lookup</h2>
          </div>
          <p className="text-xs text-warm-gray mb-3">
            Enter a patient&apos;s Emergency ID (UUID) to view their critical medical information. No authentication needed.
          </p>
          <EmergencyLookup />
        </section>

        {/* Register Newborn */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">👶</span>
            <h2 className="text-base font-semibold text-ink">Register Newborn</h2>
          </div>
          <NewbornRegistration token={token} />
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-base font-semibold text-ink mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: '🩺', label: 'Doctor Dashboard', href: '/doctor' },
              { icon: '👤', label: 'My Profile', href: '#' },
              { icon: '🩻', label: 'Show QR', href: profile ? `/qr/${profile.id}` : '#' },
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

function PatientSearch({ token }: { token: string | null }) {
  const [mobile, setMobile] = useState('')
  const [result, setResult] = useState<api.PatientSearchResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (!mobile.trim() || !token) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await api.searchPatient(token, mobile.trim())
      if (data) setResult(data)
      else setError('No patient found with that mobile number.')
    } catch {
      setError('Access denied or network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            placeholder="Mobile number (e.g. +919999999991)"
            className="flex-1 px-3 py-2 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal"
          />
          <button
            type="submit"
            disabled={loading || !mobile.trim()}
            className="bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal/90 disabled:opacity-50 transition-colors"
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>
        {error && <p className="text-xs text-critical">{error}</p>}
        {result && (
          <div className="bg-teal-light rounded-lg p-3 space-y-1">
            <p className="text-sm font-semibold text-ink">{result.firstName} {result.lastName}</p>
            <p className="text-xs text-warm-gray">DOB: {result.dateOfBirth || '—'} · Gender: {result.gender || '—'}</p>
            <p className="text-xs text-warm-gray">Mobile: {result.mobileNumber}</p>
            <Link
              href={`/emergency/${result.emergencyId}`}
              className="text-xs text-teal font-medium inline-block mt-1 hover:underline"
            >
              View emergency profile →
            </Link>
          </div>
        )}
      </form>
    </div>
  )
}

function ScanHistoryPanel({ token }: { token: string | null }) {
  const [scans, setScans] = useState<api.ScanHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    api.getScanHistory(token).then(data => {
      setScans(data)
      setLoading(false)
    }).catch(() => {
      setError('Unable to load scan history.')
      setLoading(false)
    })
  }, [token])

  if (loading) return <p className="text-xs text-warm-gray">Loading...</p>

  if (error || scans.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 text-center space-y-2">
        <p className="text-xs text-warm-gray">
          {error || 'No QR scans recorded yet.'}
        </p>
        <p className="text-[10px] text-warm-gray">
          Scans are recorded when hospital staff access emergency profiles. This endpoint may require additional setup.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {scans.map((s, i) => (
        <div key={s.id} className={`flex items-center gap-3 p-3.5 ${i > 0 ? 'border-t border-border' : ''}`}>
          <div className="flex-1">
            <p className="text-xs text-ink">Profile: {s.scannedProfileId.slice(0, 8)}...</p>
            <p className="text-[10px] text-warm-gray">{new Date(s.scanTime).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmergencyLookup() {
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
          placeholder="Emergency ID (UUID)"
          className="flex-1 px-3 py-2 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal"
          onKeyDown={e => e.key === 'Enter' && handleLookup()}
        />
        <button
          onClick={handleLookup}
          disabled={loading || !emergencyId.trim()}
          className="bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal/90 disabled:opacity-50 transition-colors"
        >
          {loading ? '...' : 'Lookup'}
        </button>
      </div>
      {error && <p className="text-xs text-critical">{error}</p>}
      {result && (
        <div className="bg-teal-light rounded-lg p-3 space-y-1">
          <p className="text-sm font-semibold text-ink">{result.firstName} {result.lastName}</p>
          <p className="text-xs text-warm-gray">Blood: {result.bloodGroup || '—'} · DOB: {result.dateOfBirth || '—'}</p>
          {result.allergies?.length > 0 && (
            <p className="text-xs text-critical">⚠️ Allergies: {result.allergies.join(', ')}</p>
          )}
          {result.conditions?.length > 0 && (
            <p className="text-xs text-ink">Conditions: {result.conditions.join(', ')}</p>
          )}
          <div className="flex gap-2 pt-1">
            <Link href={`/emergency/${result.emergencyId}`} className="text-xs text-teal font-medium hover:underline">
              Full emergency profile →
            </Link>
            <Link href={`/qr/${result.profileId}`} className="text-xs text-teal font-medium hover:underline">
              Show QR →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function NewbornRegistration({ token }: { token: string | null }) {
  const [form, setForm] = useState({
    parentProfileId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: 'A_POSITIVE',
    weight: '',
    height: '',
  })
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    setSubmitting(true)
    setError('')
    setResult(null)
    try {
      const id = await api.registerNewborn(token, {
        ...form,
        weight: form.weight ? Number(form.weight) : undefined,
        height: form.height ? Number(form.height) : undefined,
      })
      if (id) setResult(`Newborn registered! Profile ID: ${id}`)
      else setError('Registration failed.')
    } catch {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="Parent Profile UUID" value={form.parentProfileId} onChange={e => setForm(f => ({ ...f, parentProfileId: e.target.value }))}
            className="col-span-2 px-3 py-2 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal" />
          <input type="text" placeholder="First Name *" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
            className="px-3 py-2 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal" />
          <input type="text" placeholder="Last Name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
            className="px-3 py-2 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal" />
          <input type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
            className="px-3 py-2 bg-base border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-teal" />
          <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
            className="px-3 py-2 bg-base border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-teal">
            <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
          </select>
          <select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}
            className="px-3 py-2 bg-base border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-teal">
            <option value="A_POSITIVE">A+</option><option value="A_NEGATIVE">A-</option>
            <option value="B_POSITIVE">B+</option><option value="B_NEGATIVE">B-</option>
            <option value="AB_POSITIVE">AB+</option><option value="AB_NEGATIVE">AB-</option>
            <option value="O_POSITIVE">O+</option><option value="O_NEGATIVE">O-</option>
          </select>
          <input type="number" step="0.1" placeholder="Weight (kg)" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
            className="px-3 py-2 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal" />
          <input type="number" step="0.1" placeholder="Height (cm)" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))}
            className="px-3 py-2 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal" />
        </div>
        {error && <p className="text-xs text-critical">{error}</p>}
        {result && <p className="text-xs text-teal font-medium">{result}</p>}
        <button type="submit" disabled={submitting || !form.firstName || !form.dateOfBirth}
          className="bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal/90 disabled:opacity-50 transition-colors w-full">
          {submitting ? 'Registering...' : 'Register Newborn'}
        </button>
      </form>
    </div>
  )
}
