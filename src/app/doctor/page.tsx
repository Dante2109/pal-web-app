'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AuthGuard from '@/components/AuthGuard'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Search, Bot } from 'lucide-react'
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
  const [activeSection, setActiveSection] = useState('profile')
  const [loading, setLoading] = useState(true)

  const sectionTitle: Record<string, string> = {
    profile: 'Profile & Stats',
    lookup: 'Patient Lookup',
    scan: 'Scan History',
    records: 'Medical Records',
    ai: 'AI Medical Analysis',
    notifications: 'Notifications',
  }

  useEffect(() => {
    if (!token) { setLoading(false); return }
    loadProfile(token)
  }, [token])

  async function loadProfile(t: string) {
    try {
      const me = await api.getMyProfile(t)
      if (me.success && me.data) setMyProfile(me.data)
    } catch {}
    setLoading(false)
  }

  const displayName = myProfile
    ? `Dr. ${myProfile.firstName} ${myProfile.lastName || ''}`.trim()
    : 'Doctor Dashboard'

  return (
    <div className="flex-1 flex">
      <DashboardSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-ink">{displayName}</h1>
            <p className="text-xs text-warm-gray">{sectionTitle[activeSection] || 'Manage patients and medical records'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-teal-light text-teal text-xs font-medium px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-teal rounded-full" />
              Doctor
            </span>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {activeSection === 'profile' && <ProfileSection profile={myProfile} loading={loading} />}
            {activeSection === 'lookup' && <PatientLookup token={token} />}
            {activeSection === 'scan' && <ScanHistoryPanel token={token} />}
            {activeSection === 'records' && <RecordsLookup token={token} />}
            {activeSection === 'ai' && <AIAnalysis token={token} />}
            {activeSection === 'notifications' && <NotificationsPanel token={token} />}
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
    UserRound: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>,
    Search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    FileText: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    Brain: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 4.5a5.5 5.5 0 0 1 5.5 5.5c0 2-1.5 3.5-2.5 4.5v3a1.5 1.5 0 0 1-3 0v-3c-1-1-2.5-2.5-2.5-4.5A5.5 5.5 0 0 1 12 4.5z" /><path d="M12 2v2.5" /><path d="M8 4.5 6.5 6" /><path d="M16 4.5 17.5 6" /><circle cx="12" cy="9" r="1.5" /></svg>,
    Bell: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  }
  return icons[name] || null
}

function ProfileSection({ profile, loading }: { profile: ProfileResponse | null; loading: boolean }) {
  if (loading) return <div className="bg-card border border-border rounded-xl p-8 text-center"><p className="text-sm text-warm-gray">Loading...</p></div>
  if (!profile) return <div className="bg-card border border-border rounded-xl p-8 text-center"><p className="text-sm text-warm-gray">Profile not available</p></div>

  const stats = [
    { label: 'Emergency ID', value: profile.emergencyId?.slice(0, 12) || '—', color: 'bg-blue-50 text-blue-700' },
    { label: 'Blood Group', value: profile.bloodGroup?.replace(/_/g, ' ') || '—', color: 'bg-red-50 text-red-700' },
    { label: 'Gender', value: profile.gender || '—', color: 'bg-purple-50 text-purple-700' },
    { label: 'DOB', value: profile.dateOfBirth || '—', color: 'bg-amber-50 text-amber-700' },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 bg-teal rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0">
          {profile.firstName[0]}{profile.lastName?.[0] || ''}
        </div>
        <div>
          <h2 className="text-lg font-bold text-ink">Dr. {profile.firstName} {profile.lastName || ''}</h2>
          <p className="text-xs text-warm-gray">
            {profile.mobile ? <span>{profile.mobile}</span> : 'No contact info'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${s.color}`}>{s.label}</p>
            <p className="text-sm font-bold text-ink mt-2 font-mono">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PatientLookup({ token }: { token: string | null }) {
  const [emergencyId, setEmergencyId] = useState('')
  const [result, setResult] = useState<api.EmergencyProfileResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiData, setAiData] = useState<Record<string, string> | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [token_self] = useState(token)

  async function handleLookup() {
    if (!emergencyId.trim()) return
    setLoading(true); setError(''); setResult(null); setAiData(null)
    try {
      const data = await api.getEmergencyProfile(emergencyId.trim(), token_self || undefined)
      if (data) {
        setResult(data)
        if (data.profileId && token_self) {
          setAiLoading(true)
          api.getMedicalData(data.profileId, token_self).then(metrics => {
            if (metrics) setAiData({ 'Metrics': `${metrics.length} data points` })
          }).finally(() => setAiLoading(false))
        }
      }
      else setError('No patient found with that Emergency ID')
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-bold text-ink">Patient Lookup</h2>
      <p className="text-xs text-warm-gray">Enter a patient&apos;s Emergency ID to access their critical medical information.</p>
      <div className="flex gap-2">
        <input
          type="text" value={emergencyId} onChange={e => setEmergencyId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLookup()}
          placeholder="Emergency ID (UUID)"
          className="flex-1 px-3 sm:px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all font-mono"
        />
        <button
          onClick={handleLookup} disabled={loading || !emergencyId.trim()}
          className="bg-teal text-white px-3 sm:px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-teal/90 disabled:opacity-50 transition-colors flex items-center gap-1 sm:gap-2 shrink-0"
        >
          <span className="sm:hidden"><Search className="w-4 h-4" /></span><span className="hidden sm:inline">{loading ? 'Searching...' : 'Search'}</span>
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
          {(result.conditions?.length ?? 0) > 0 && <p className="text-xs text-ink"><span className="font-medium">Conditions:</span> {result.conditions!.join(', ')}</p>}
          {(aiLoading || aiData) && (
            <div className="bg-white border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Bot className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-xs font-semibold text-purple-700">AI Analysis</span>
                {aiLoading && <span className="w-3 h-3 border-2 border-purple/20 border-t-purple-600 rounded-full animate-spin ml-auto" />}
              </div>
              {aiData && <p className="text-xs text-ink leading-relaxed">{Object.values(aiData)[0]}</p>}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Link href={`/emergency/${result.emergencyId}`} className="text-xs text-teal font-semibold hover:underline">View full profile →</Link>
            <Link href={`/qr/${result.profileId}`} className="text-xs text-teal font-semibold hover:underline">QR Code →</Link>
          </div>
        </div>
      )}
    </div>
  )
}

function ScanHistoryPanel({ token }: { token: string | null }) {
  const [scans, setScans] = useState<api.ScanHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    api.getScanHistory(token).then(data => { setScans(data); setLoading(false) }).catch(() => { setError('Unable to load scan history.'); setLoading(false) })
  }, [token])

  function copyId(scanId: string, profileId: string) {
    navigator.clipboard.writeText(profileId)
    setCopiedId(scanId)
    setTimeout(() => setCopiedId(null), 1500)
  }

  if (loading) return <div className="bg-card border border-border rounded-xl p-8 text-center"><p className="text-sm text-warm-gray">Loading scan history...</p></div>

  if (error || scans.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center space-y-3">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8A8F91" strokeWidth="1.5" strokeLinecap="round" className="mx-auto"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
        <p className="text-sm text-warm-gray font-medium">{error || 'No QR scans recorded yet'}</p>
        <p className="text-xs text-warm-gray max-w-sm mx-auto">Scans are recorded when you access emergency profiles.</p>
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
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink font-medium truncate">{s.scannedProfileName || 'Unknown'}</p>
              <p className="text-xs text-warm-gray font-mono">{s.scannedProfileId}</p>
              <p className="text-xs text-warm-gray">{new Date(s.scanTime).toLocaleString()}</p>
            </div>
            <button
              onClick={() => copyId(s.id, s.scannedProfileId)}
              className="shrink-0 text-xs font-medium transition-colors"
              title="Copy Profile ID"
            >
              {copiedId === s.id ? (
                <span className="text-green-600">Copied!</span>
              ) : (
                <span className="text-teal hover:text-teal/80">Copy Profile ID</span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecordsLookup({ token }: { token: string | null }) {
  const [profileId, setProfileId] = useState('')
  const [records, setRecords] = useState<api.MedicalRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  async function handleLookup() {
    if (!profileId.trim() || !token) return
    setLoading(true); setError(''); setRecords([]); setSearched(false)
    try {
      const res = await api.getProfileRecords(token, profileId.trim())
      if (res.success && res.data) setRecords(res.data)
      else setError(res.message || 'No records found')
    } catch { setError('Network error') }
    finally { setLoading(false); setSearched(true) }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-bold text-ink">Medical Records</h2>
      <p className="text-xs text-warm-gray">Access patient medical records by their profile ID.</p>
      <div className="flex gap-2">
        <input
          type="text" value={profileId} onChange={e => setProfileId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLookup()}
          placeholder="Profile UUID"
          className="flex-1 px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all font-mono"
        />
        <button
          onClick={handleLookup} disabled={loading || !profileId.trim()}
          className="bg-teal text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-teal/90 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Fetching...' : 'Fetch'}
        </button>
      </div>
      {error && <p className="text-xs text-critical bg-critical-light rounded-lg px-3 py-2">{error}</p>}
      {searched && !loading && !error && records.length === 0 && (
        <div className="bg-subtle rounded-xl p-6 text-center space-y-2 border border-border/50">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8A8F91" strokeWidth="1.5" strokeLinecap="round" className="mx-auto"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
          <p className="text-sm text-warm-gray font-medium">No medical records found</p>
          <p className="text-xs text-warm-gray">This patient has no medical records uploaded yet.</p>
        </div>
      )}
      {records.length > 0 && (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {records.map(r => (
            <div key={r.id} className="bg-subtle rounded-xl p-4 space-y-1.5 border border-border/50">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">{r.title}</p>
                <span className="text-[10px] bg-card text-warm-gray font-medium px-2 py-0.5 rounded-full border border-border capitalize">{r.type}</span>
              </div>
              <p className="text-xs text-warm-gray">{new Date(r.uploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              {r.description && <p className="text-xs text-ink/70">{r.description}</p>}
              {r.presignedUrl && (
                <a href={r.presignedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-teal font-semibold inline-flex items-center gap-1 hover:underline mt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                  View document
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
    setLoading(true); setResult('')
    try {
      const data = await api.getMedicalData(profileId.trim(), token)
      setResult(data ? `${data.length} metrics found` : 'No analysis available')
    } catch { setResult('Error fetching analysis') }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-bold text-ink">AI Medical Analysis</h2>
      <p className="text-xs text-warm-gray">Analyze patient progress for specific conditions using AI.</p>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text" value={profileId} onChange={e => setProfileId(e.target.value)}
          placeholder="Profile UUID"
          className="px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all font-mono"
        />
        <input
          type="text" value={condition} onChange={e => setCondition(e.target.value)}
          placeholder="Condition (e.g. Diabetes)"
          className="px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all"
        />
      </div>
      <button
        onClick={handleAnalyze} disabled={loading || !profileId.trim() || !condition.trim()}
        className="bg-teal text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-teal/90 disabled:opacity-50 transition-colors flex items-center gap-2"
      >
        {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing</> : 'Analyze'}
      </button>
      {result && (
        <div className="bg-teal-light rounded-xl p-4 text-sm text-ink whitespace-pre-wrap max-h-60 overflow-y-auto border border-teal/20 leading-relaxed">
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
    api.getNotifications(token).then(data => { setNotifications(data); setLoading(false) }).catch(() => setLoading(false))
  }, [token])

  if (loading) return <div className="bg-card border border-border rounded-xl p-8 text-center"><p className="text-sm text-warm-gray">Loading notifications...</p></div>

  if (notifications.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center space-y-2">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8A8F91" strokeWidth="1.5" strokeLinecap="round" className="mx-auto"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
        <p className="text-sm text-warm-gray font-medium">No notifications</p>
        <p className="text-xs text-warm-gray">You&apos;re all caught up.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {notifications.slice(0, 10).map(n => (
        <div key={n.id} className={`bg-card border rounded-xl p-4 flex items-start gap-3 ${n.read ? 'border-border opacity-60' : 'border-teal/30 bg-teal-light/30'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.read ? 'bg-subtle' : 'bg-teal text-white'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink">{n.message}</p>
            <p className="text-xs text-warm-gray mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
          {!n.read && <span className="w-2 h-2 bg-teal rounded-full shrink-0 mt-1.5" />}
        </div>
      ))}
    </div>
  )
}
