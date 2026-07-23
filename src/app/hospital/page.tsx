'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AuthGuard from '@/components/AuthGuard'
import DashboardSidebar from '@/components/DashboardSidebar'
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
  const [activeSection, setActiveSection] = useState('search')

  useEffect(() => {
    if (!token) return
    api.getMyProfile(token).then(r => {
      if (r.success && r.data) setProfile(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [token])

  return (
    <div className="flex-1 flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-ink">{profile ? `${profile.firstName} ${profile.lastName || ''}` : 'Hospital Dashboard'}</h1>
            <p className="text-xs text-warm-gray">Emergency department management</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
              Hospital
            </span>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <TabBar active={activeSection} onChange={setActiveSection} tabs={[
              { id: 'search', label: 'Search Patient', icon: 'Search' },
              { id: 'scan', label: 'QR History', icon: 'Smartphone' },
              { id: 'lookup', label: 'Emergency Lookup', icon: 'AlertTriangle' },
              { id: 'newborn', label: 'Newborn Registration', icon: 'Baby' },
            ]} />

            {activeSection === 'search' && <PatientSearch token={token} />}
            {activeSection === 'scan' && <ScanHistoryPanel token={token} />}
            {activeSection === 'lookup' && <EmergencyLookup />}
            {activeSection === 'newborn' && <NewbornRegistration token={token} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function TabBar({ active, onChange, tabs }: {
  active: string
  onChange: (id: string) => void
  tabs: { id: string; label: string; icon: string }[]
}) {
  return (
    <div className="flex gap-1 bg-card border border-border rounded-xl p-1 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
            ${active === tab.id
              ? 'bg-teal text-white shadow-sm'
              : 'text-warm-gray hover:text-ink hover:bg-subtle'
            }
          `}
        >
          <TabIcon name={tab.icon} />
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function TabIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    Search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    Smartphone: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
    AlertTriangle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    Baby: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /><path d="M6 14a6 6 0 0 1 12 0" /><circle cx="9" cy="9" r=".5" /><circle cx="15" cy="9" r=".5" /></svg>,
  }
  return icons[name] || null
}

function PatientSearch({ token }: { token: string | null }) {
  const [mobile, setMobile] = useState('')
  const [result, setResult] = useState<api.PatientSearchResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (!mobile.trim() || !token) return
    setLoading(true); setError(''); setResult(null)
    try {
      const data = await api.searchPatient(token, mobile.trim())
      if (data) setResult(data)
      else setError('No patient found with that mobile number.')
    } catch { setError('Access denied or network error.') }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-bold text-ink">Search Patient by Mobile</h2>
      <p className="text-xs text-warm-gray">Look up a patient registered in the system using their mobile number.</p>
      <form onSubmit={handleSearch}>
        <div className="flex gap-2">
          <input
            type="text" value={mobile} onChange={e => setMobile(e.target.value)}
            placeholder="+919999999991"
            className="flex-1 px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all font-mono"
          />
          <button
            type="submit" disabled={loading || !mobile.trim()}
            className="bg-teal text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-teal/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Searching</> : 'Search'}
          </button>
        </div>
      </form>
      {error && <p className="text-xs text-critical bg-critical-light rounded-lg px-3 py-2">{error}</p>}
      {result && (
        <div className="bg-teal-light rounded-xl p-4 space-y-2.5 border border-teal/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center text-white text-sm font-bold">{result.firstName[0]}{result.lastName?.[0] || ''}</div>
            <div>
              <p className="text-sm font-bold text-ink">{result.firstName} {result.lastName || ''}</p>
              <p className="text-xs text-warm-gray">Mobile: {result.mobileNumber}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.dateOfBirth && <span className="bg-white text-xs font-medium px-2.5 py-1 rounded-full border border-teal/20">DOB: {result.dateOfBirth}</span>}
            {result.gender && <span className="bg-white text-xs font-medium px-2.5 py-1 rounded-full border border-teal/20">{result.gender}</span>}
          </div>
          <Link href={`/emergency/${result.emergencyId}`} className="text-xs text-teal font-semibold inline-flex items-center gap-1 hover:underline">
            View emergency profile
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </Link>
        </div>
      )}
    </div>
  )
}

function ScanHistoryPanel({ token }: { token: string | null }) {
  const [scans, setScans] = useState<api.ScanHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    api.getScanHistory(token).then(data => { setScans(data); setLoading(false) }).catch(() => { setError('Unable to load scan history.'); setLoading(false) })
  }, [token])

  if (loading) return <div className="bg-card border border-border rounded-xl p-8 text-center"><p className="text-sm text-warm-gray">Loading scan history...</p></div>

  if (error || scans.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center space-y-3">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8A8F91" strokeWidth="1.5" strokeLinecap="round" className="mx-auto"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
        <p className="text-sm text-warm-gray font-medium">{error || 'No QR scans recorded yet'}</p>
        <p className="text-xs text-warm-gray max-w-sm mx-auto">Scans are recorded when hospital staff access emergency profiles. This endpoint may require additional backend setup.</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="divide-y divide-border">
        {scans.map(s => (
          <div key={s.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-subtle/50 transition-colors">
            <div className="w-8 h-8 bg-teal-light rounded-lg flex items-center justify-center text-teal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-ink font-medium font-mono">{s.scannedProfileId}</p>
              <p className="text-xs text-warm-gray">{new Date(s.scanTime).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
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
    setLoading(true); setError(''); setResult(null)
    try {
      const data = await api.getEmergencyProfile(emergencyId.trim())
      if (data) setResult(data)
      else setError('No patient found with that Emergency ID')
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-bold text-ink">Emergency Profile Lookup</h2>
      <p className="text-xs text-warm-gray">Enter a patient&apos;s Emergency ID (UUID) to view their critical medical information. No authentication needed.</p>
      <div className="flex gap-2">
        <input
          type="text" value={emergencyId} onChange={e => setEmergencyId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLookup()}
          placeholder="Emergency ID (UUID)"
          className="flex-1 px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all font-mono"
        />
        <button
          onClick={handleLookup} disabled={loading || !emergencyId.trim()}
          className="bg-teal text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-teal/90 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Loading</> : 'Lookup'}
        </button>
      </div>
      {error && <p className="text-xs text-critical bg-critical-light rounded-lg px-3 py-2">{error}</p>}
      {result && (
        <div className="bg-teal-light rounded-xl p-4 space-y-2.5 border border-teal/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center text-white text-sm font-bold">{result.firstName[0]}{result.lastName?.[0] || ''}</div>
            <div>
              <p className="text-sm font-bold text-ink">{result.firstName} {result.lastName || ''}</p>
              <p className="text-xs text-warm-gray">Emergency ID: {result.emergencyId?.slice(0, 12)}...</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.bloodGroup && <span className="bg-white text-xs font-medium px-2.5 py-1 rounded-full border border-teal/20">{result.bloodGroup.replace(/_/g, ' ')}</span>}
            {result.gender && <span className="bg-white text-xs font-medium px-2.5 py-1 rounded-full border border-teal/20">{result.gender}</span>}
            {result.dateOfBirth && <span className="bg-white text-xs font-medium px-2.5 py-1 rounded-full border border-teal/20">{result.dateOfBirth}</span>}
          </div>
          {(result.allergies?.length ?? 0) > 0 && (
            <div className="bg-white border border-red-200 rounded-lg p-3">
              <p className="text-xs font-bold text-critical mb-1">⚠ Allergies</p>
              <div className="flex flex-wrap gap-1">{result.allergies!.map(a => <span key={a} className="text-xs bg-red-50 text-critical px-2 py-0.5 rounded-full">{a}</span>)}</div>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Link href={`/emergency/${result.emergencyId}`} className="text-xs text-teal font-semibold hover:underline">Full profile →</Link>
            <Link href={`/qr/${result.profileId}`} className="text-xs text-teal font-semibold hover:underline">QR Code →</Link>
          </div>
        </div>
      )}
    </div>
  )
}

function NewbornRegistration({ token }: { token: string | null }) {
  const [form, setForm] = useState({
    parentProfileId: '', firstName: '', lastName: '', dateOfBirth: '',
    gender: 'MALE', bloodGroup: 'A_POSITIVE', weight: '', height: '',
  })
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    setSubmitting(true); setError(''); setResult(null)
    try {
      const id = await api.registerNewborn(token, { ...form, weight: form.weight ? Number(form.weight) : undefined, height: form.height ? Number(form.height) : undefined })
      if (id) setResult(`Newborn registered! Profile ID: ${id}`)
      else setError('Registration failed.')
    } catch { setError('Network error') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-bold text-ink">Register Newborn</h2>
      <p className="text-xs text-warm-gray">Register a newborn baby and link them to a parent profile.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="Parent Profile UUID *" value={form.parentProfileId} onChange={e => setForm(f => ({ ...f, parentProfileId: e.target.value }))}
            className="col-span-2 px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all font-mono" />
          <input type="text" placeholder="First Name *" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
            className="px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all" />
          <input type="text" placeholder="Last Name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
            className="px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all" />
          <input type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
            className="px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all" />
          <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
            className="px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all">
            <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
          </select>
          <select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}
            className="px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all">
            <option value="A_POSITIVE">A+</option><option value="A_NEGATIVE">A-</option>
            <option value="B_POSITIVE">B+</option><option value="B_NEGATIVE">B-</option>
            <option value="AB_POSITIVE">AB+</option><option value="AB_NEGATIVE">AB-</option>
            <option value="O_POSITIVE">O+</option><option value="O_NEGATIVE">O-</option>
          </select>
          <input type="number" step="0.1" placeholder="Weight (kg)" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
            className="px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all" />
          <input type="number" step="0.1" placeholder="Height (cm)" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))}
            className="px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all" />
        </div>
        {error && <p className="text-xs text-critical bg-critical-light rounded-lg px-3 py-2">{error}</p>}
        {result && <p className="text-xs text-teal font-semibold bg-teal-light rounded-lg px-3 py-2">{result}</p>}
        <button type="submit" disabled={submitting || !form.firstName || !form.dateOfBirth}
          className="bg-teal text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-teal/90 disabled:opacity-50 transition-colors w-full flex items-center justify-center gap-2">
          {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Registering</> : 'Register Newborn'}
        </button>
      </form>
    </div>
  )
}
