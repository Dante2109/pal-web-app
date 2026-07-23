'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AuthGuard from '@/components/AuthGuard'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Search, Plus, ArrowLeft, Phone, Mail, MapPin, Calendar, Clock, Award, BookOpen, ChevronDown, ChevronRight, Stethoscope, Edit3, MoreHorizontal, X } from 'lucide-react'
import * as api from '@/lib/api'
import type { ProfileResponse, Doctor } from '@/lib/api'

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
              { id: 'doctors', label: 'Doctors', icon: 'Stethoscope' },
              { id: 'search', label: 'Search Patient', icon: 'Search' },
              { id: 'scan', label: 'QR History', icon: 'Smartphone' },
              { id: 'lookup', label: 'Emergency Lookup', icon: 'AlertTriangle' },
              { id: 'newborn', label: 'Newborn Registration', icon: 'Baby' },
            ]} />

            {activeSection === 'doctors' && <DoctorManagement token={token} />}
            {activeSection === 'search' && <PatientSearch token={token} />}
            {activeSection === 'scan' && <ScanHistoryPanel token={token} />}
            {activeSection === 'lookup' && <EmergencyLookup token={token} />}
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
    Stethoscope: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 8V6a4 4 0 0 1 8 0v2" /><path d="M4 12a4 4 0 0 0 8 0" /><path d="M16 8h1a3 3 0 0 1 3 3v1a6 6 0 0 1-6 6h-2" /><circle cx="16" cy="8" r="3" /></svg>,
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

function EmergencyLookup({ token }: { token: string | null }) {
  const [emergencyId, setEmergencyId] = useState('')
  const [result, setResult] = useState<api.EmergencyProfileResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLookup() {
    if (!emergencyId.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const data = await api.getEmergencyProfile(emergencyId.trim(), token)
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
          className="flex-1 px-3 sm:px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all font-mono"
        />
        <button
          onClick={handleLookup} disabled={loading || !emergencyId.trim()}
          className="bg-teal text-white px-3 sm:px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-teal/90 disabled:opacity-50 transition-colors flex items-center gap-1 sm:gap-2 shrink-0"
        >
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Search className="w-4 h-4 sm:hidden" /><span className="hidden sm:inline">Lookup</span></>}
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

// ---------- Doctor Management ----------

function DoctorManagement({ token }: { token: string | null }) {
  const [view, setView] = useState<'grid' | 'add' | 'detail'>('grid')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    api.getDoctors(token).then(data => { setDoctors(data); setLoading(false) }).catch(() => setLoading(false))
  }, [token])

  if (loading) return <div className="bg-card border border-border rounded-xl p-8 text-center"><p className="text-sm text-warm-gray">Loading doctors...</p></div>

  if (view === 'add') return <AddDoctorForm token={token} onBack={() => setView('grid')} onCreated={(d) => { setDoctors(p => [...p, d]); setView('grid') }} />

  if (view === 'detail' && selectedDoctor) return <DoctorDetailView doctor={selectedDoctor} onBack={() => { setSelectedDoctor(null); setView('grid') }} />

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-ink">Doctor Grid</h2>
            <span className="bg-teal-light text-teal text-xs font-semibold px-3 py-1 rounded-full">
              Total Doctors: {doctors.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-ink px-3 py-2 rounded-lg hover:bg-subtle transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>
              Filter
            </button>
            <button
              onClick={() => setView('add')}
              className="flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Doctor
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {doctors.map(doctor => (
          <DoctorCard key={doctor.id} doctor={doctor} onSelect={(d) => { setSelectedDoctor(d); setView('detail') }} />
        ))}
      </div>

      {doctors.length > 3 && (
        <div className="flex justify-center">
          <button className="flex items-center gap-2 text-sm font-semibold text-teal px-6 py-3 rounded-xl border border-teal/20 hover:bg-teal-light transition-colors">
            Load More
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="12 5 19 12 12 19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
        </div>
      )}
    </div>
  )
}

function DoctorCard({ doctor, onSelect }: { doctor: Doctor; onSelect: (d: Doctor) => void }) {
  const initials = `${doctor.firstName[0]}${doctor.lastName[0] || ''}`
  const nextAvail = doctor.availability[0]

  return (
    <div
      onClick={() => onSelect(doctor)}
      className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-teal to-teal/80 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-ink">Dr. {doctor.firstName} {doctor.lastName}</h3>
                <p className="text-xs text-teal font-medium mt-0.5">{doctor.designation}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-subtle" onClick={e => { e.stopPropagation(); onSelect(doctor) }}>
                <MoreHorizontal className="w-4 h-4 text-warm-gray" />
              </button>
            </div>
            {nextAvail && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-warm-gray">
                <Calendar className="w-3 h-3" />
                Available: {nextAvail.day}, {nextAvail.slots[0]?.from || ''} - {nextAvail.slots[nextAvail.slots.length - 1]?.to || ''}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-warm-gray uppercase tracking-wider">Starts From</span>
                <p className="text-sm font-bold text-ink">₹{doctor.consultationCharge}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-teal font-medium">
                <Clock className="w-3 h-3" /> View Schedule
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- Add Doctor Form ----------

function AddDoctorForm({ token, onBack, onCreated }: { token: string | null; onBack: () => void; onCreated: (d: Doctor) => void }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', designation: '', department: '',
    qualification: '', experience: 0, bloodGroup: 'O_POSITIVE', gender: 'MALE',
    dateOfBirth: '', address: '', city: '', state: '', country: 'USA', pincode: '',
    consultationCharge: 0, bio: '', languages: [] as string[],
  })
  const [education, setEducation] = useState<{ degree: string; university: string; from: string; to: string }[]>([])
  const [availability, setAvailability] = useState<{ day: string; from: string; to: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [langInput, setLangInput] = useState('')

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  function addLanguage() {
    if (langInput.trim() && !form.languages.includes(langInput.trim())) {
      setForm(f => ({ ...f, languages: [...f.languages, langInput.trim()] }))
      setLangInput('')
    }
  }

  function removeLanguage(lang: string) {
    setForm(f => ({ ...f, languages: f.languages.filter(l => l !== lang) }))
  }

  function addAvailability(day: string) {
    setAvailability(p => [...p, { day, from: '09:00', to: '17:00' }])
  }

  function updateAvailability(i: number, field: string, value: string) {
    setAvailability(p => p.map((a, idx) => idx === i ? { ...a, [field]: value } : a))
  }

  function removeAvailability(i: number) {
    setAvailability(p => p.filter((_, idx) => idx !== i))
  }

  function addEducation() {
    setEducation(p => [...p, { degree: '', university: '', from: '', to: '' }])
  }

  function updateEducation(i: number, field: string, value: string) {
    setEducation(p => p.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  }

  function removeEducation(i: number) {
    setEducation(p => p.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token || !form.firstName || !form.email) return
    setSubmitting(true); setError(''); setSuccess('')
    try {
      const groupedAvailability = daysOfWeek.map(day => ({
        day,
        slots: availability.filter(a => a.day === day).map(a => ({ from: a.from, to: a.to })),
      })).filter(a => a.slots.length > 0)

      const doctor = await api.createDoctor(token, {
        ...form,
        education,
        availability: groupedAvailability,
      })
      onCreated(doctor)
      setSuccess(`Dr. ${doctor.firstName} ${doctor.lastName} registered successfully!`)
    } catch { setError('Failed to create doctor') }
    finally { setSubmitting(false) }
  }

  function inputCls() { return 'w-full px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all' }
  function labelCls() { return 'block text-xs font-medium text-warm-gray mb-1.5' }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:bg-subtle text-warm-gray hover:text-ink transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-bold text-ink">New Doctor</h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} className="px-4 py-2 text-sm font-medium text-warm-gray hover:text-ink rounded-lg hover:bg-subtle transition-colors">Cancel</button>
          <button type="submit" disabled={submitting || !form.firstName || !form.email}
            className="bg-teal text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-teal/90 disabled:opacity-50 transition-colors flex items-center gap-2">
            {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving</> : 'Save Doctor'}
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 space-y-6">
        {error && <p className="text-xs text-critical bg-critical-light rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="text-xs text-teal font-semibold bg-teal-light rounded-lg px-3 py-2">{success}</p>}

        {/* Contact Information */}
        <Section title="Contact Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls()}>Profile Image</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-subtle rounded-xl flex items-center justify-center text-warm-gray border-2 border-dashed border-border">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs text-warm-gray">Upload photo</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <InputField label="First Name *" value={form.firstName} onChange={v => setForm(f => ({ ...f, firstName: v }))} placeholder="First name" />
            <InputField label="Last Name" value={form.lastName} onChange={v => setForm(f => ({ ...f, lastName: v }))} placeholder="Last name" />
            <InputField label="Email Address *" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="email@example.com" type="email" />
            <InputField label="Phone Number *" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+1 54546 45648" />
            <InputField label="DOB" value={form.dateOfBirth} onChange={v => setForm(f => ({ ...f, dateOfBirth: v }))} type="date" />
            <InputField label="Year Of Experience" value={String(form.experience)} onChange={v => setForm(f => ({ ...f, experience: Number(v) || 0 }))} placeholder="15" type="number" />
            <SelectField label="Department *" value={form.department} onChange={v => setForm(f => ({ ...f, department: v }))}
              options={['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Psychiatry', 'Radiology', 'General Medicine']} />
            <SelectField label="Designation *" value={form.designation} onChange={v => setForm(f => ({ ...f, designation: v }))}
              options={['Cardiologist', 'Neurologist', 'Pediatrician', 'Orthopedist', 'Dermatologist', 'Psychiatrist', 'Radiologist', 'General Physician']} />
            <InputField label="Medical License Number" value={form.qualification} onChange={v => setForm(f => ({ ...f, qualification: v }))} placeholder="ML566659898" />
            <div>
              <label className={labelCls()}>Language Spoken</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.languages.map(lang => (
                  <span key={lang} className="inline-flex items-center gap-1 bg-teal-light text-teal text-xs font-medium px-2.5 py-1 rounded-full">
                    {lang}
                    <button type="button" onClick={() => removeLanguage(lang)} className="hover:text-critical"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={langInput} onChange={e => setLangInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLanguage() } }}
                  placeholder="Type language and press Enter" className={inputCls()} />
              </div>
            </div>
            <SelectField label="Blood Group" value={form.bloodGroup} onChange={v => setForm(f => ({ ...f, bloodGroup: v }))}
              options={['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']} />
            <SelectField label="Gender" value={form.gender} onChange={v => setForm(f => ({ ...f, gender: v }))}
              options={['MALE', 'FEMALE', 'OTHER']} />
          </div>
          <div className="mt-4">
            <label className={labelCls()}>Bio</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="About the doctor..." rows={3} className={inputCls() + ' resize-none'} />
          </div>
        </Section>

        {/* Address Information */}
        <Section title="Address Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="Street address" />
            <InputField label="Pincode" value={form.pincode} onChange={v => setForm(f => ({ ...f, pincode: v }))} placeholder="89109" />
            <SelectField label="Country" value={form.country} onChange={v => setForm(f => ({ ...f, country: v }))} options={['USA', 'Canada', 'UK', 'Australia']} />
            <InputField label="City" value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} placeholder="Las Vegas" />
            <InputField label="State" value={form.state} onChange={v => setForm(f => ({ ...f, state: v }))} placeholder="NV" />
          </div>
        </Section>

        {/* Appointment Schedule */}
        <Section title="Appointment Schedule">
          <div className="space-y-3">
            {availability.map((a, i) => (
              <div key={i} className="flex flex-wrap items-end gap-3 p-3 bg-subtle/40 rounded-xl">
                <div className="w-full sm:w-auto">
                  <label className={labelCls()}>Day</label>
                  <select value={a.day} onChange={e => updateAvailability(i, 'day', e.target.value)}
                    className={inputCls() + ' min-w-[140px]'}>
                    {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <InputField label="From" value={a.from} onChange={v => updateAvailability(i, 'from', v)} type="time" cls="min-w-[110px]" />
                <InputField label="To" value={a.to} onChange={v => updateAvailability(i, 'to', v)} type="time" cls="min-w-[110px]" />
                <button type="button" onClick={() => removeAvailability(i)}
                  className="p-2 rounded-lg hover:bg-critical-light text-warm-gray hover:text-critical transition-colors mb-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addAvailability('Monday')}
              className="flex items-center gap-2 text-sm font-medium text-teal hover:text-teal/80 transition-colors">
              <Plus className="w-4 h-4" /> Add Schedule
            </button>
          </div>
        </Section>

        {/* Educational Information */}
        <Section title="Educational Information">
          <div className="space-y-3">
            {education.map((e, i) => (
              <div key={i} className="flex flex-wrap items-end gap-3 p-3 bg-subtle/40 rounded-xl">
                <InputField label="Degree" value={e.degree} onChange={v => updateEducation(i, 'degree', v)} placeholder="MD in Cardiology" cls="min-w-[180px]" />
                <InputField label="University" value={e.university} onChange={v => updateEducation(i, 'university', v)} placeholder="University name" cls="min-w-[180px]" />
                <InputField label="From" value={e.from} onChange={v => updateEducation(i, 'from', v)} type="date" cls="min-w-[130px]" />
                <InputField label="To" value={e.to} onChange={v => updateEducation(i, 'to', v)} type="date" cls="min-w-[130px]" />
                <button type="button" onClick={() => removeEducation(i)}
                  className="p-2 rounded-lg hover:bg-critical-light text-warm-gray hover:text-critical transition-colors mb-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addEducation}
              className="flex items-center gap-2 text-sm font-medium text-teal hover:text-teal/80 transition-colors">
              <Plus className="w-4 h-4" /> Add Education
            </button>
          </div>
        </Section>

        {/* Appointment Information */}
        <Section title="Appointment Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Consultation Charge (₹)" value={String(form.consultationCharge)} onChange={v => setForm(f => ({ ...f, consultationCharge: Number(v) || 0 }))} placeholder="499" type="number" />
          </div>
        </Section>
      </div>

      <div className="flex items-center justify-end gap-2 px-4 sm:px-6 py-4 border-t border-border">
        <button type="button" onClick={onBack} className="px-4 py-2 text-sm font-medium text-warm-gray hover:text-ink rounded-lg hover:bg-subtle transition-colors">Cancel</button>
        <button type="submit" disabled={submitting || !form.firstName || !form.email}
          className="bg-teal text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-teal/90 disabled:opacity-50 transition-colors flex items-center gap-2">
          {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving</> : 'Save Doctor'}
        </button>
      </div>
    </form>
  )
}

// ---------- Doctor Detail View ----------

function DoctorDetailView({ doctor, onBack }: { doctor: Doctor; onBack: () => void }) {
  const initials = `${doctor.firstName[0]}${doctor.lastName[0] || ''}`
  const bgDisplay = doctor.bloodGroup.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-warm-gray hover:text-ink transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Doctors
      </button>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Doctor Header */}
        <div className="bg-gradient-to-r from-teal/5 to-teal/10 border-b border-border px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-teal to-teal/80 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-ink">Dr. {doctor.firstName} {doctor.lastName}</h2>
                <span className="bg-teal-light text-teal text-[10px] font-semibold px-2.5 py-0.5 rounded-full">{doctor.designation}</span>
                <span className="bg-green-50 text-green-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">{doctor.active ? 'Available' : 'Unavailable'}</span>
              </div>
              <p className="text-sm text-warm-gray mt-0.5">{doctor.qualification}</p>
              <p className="text-xs text-teal font-medium mt-0.5">
                <MapPin className="w-3 h-3 inline mr-1" />{doctor.city}, {doctor.state}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl px-5 py-3 text-center shrink-0">
              <p className="text-[10px] text-warm-gray uppercase tracking-wider">Consultation</p>
              <p className="text-lg font-bold text-teal">₹{doctor.consultationCharge}<span className="text-xs text-warm-gray font-normal"> / 30 Min</span></p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Availability */}
              <DetailSection title="Availability" icon={<Calendar className="w-4 h-4" />}>
                <div className="space-y-2">
                  {doctor.availability.map(a => (
                    <div key={a.day} className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-ink w-24 shrink-0">{a.day}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {a.slots.map((s, i) => (
                          <span key={i} className="bg-teal-light text-teal text-xs font-medium px-2.5 py-1 rounded-full">{s.from} - {s.to}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {doctor.availability.length === 0 && <p className="text-xs text-warm-gray">No availability set</p>}
                </div>
              </DetailSection>

              {/* Bio */}
              <DetailSection title="Short Bio" icon={<BookOpen className="w-4 h-4" />}>
                <p className="text-sm text-ink leading-relaxed">{doctor.bio}</p>
              </DetailSection>

              {/* Education */}
              <DetailSection title="Education Information" icon={<Award className="w-4 h-4" />}>
                <div className="space-y-3">
                  {doctor.education.map((e, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-teal mt-2 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-ink">{e.degree} - {e.university}</p>
                        {e.from && <p className="text-xs text-warm-gray">{e.from} - {e.to}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </DetailSection>

              {/* Awards */}
              {doctor.awards.length > 0 && (
                <DetailSection title="Awards & Recognition" icon={<Award className="w-4 h-4" />}>
                  <div className="space-y-3">
                    {doctor.awards.map((a, i) => (
                      <div key={i} className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-sm font-semibold text-ink">{a.title}</p>
                        <p className="text-xs text-warm-gray mt-0.5">{a.description}</p>
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}

              {/* Certifications */}
              {doctor.certifications.length > 0 && (
                <DetailSection title="Certifications" icon={<Award className="w-4 h-4" />}>
                  <div className="space-y-3">
                    {doctor.certifications.map((c, i) => (
                      <div key={i} className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm font-semibold text-ink">{c.title}</p>
                        <p className="text-xs text-warm-gray mt-0.5">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </DetailSection>
              )}
            </div>

            {/* Right column - sidebar info */}
            <div className="space-y-4">
              <div className="bg-subtle/40 rounded-xl p-4 space-y-3 border border-border">
                <h3 className="text-xs font-semibold text-warm-gray uppercase tracking-wider">About</h3>
                <InfoRow icon={<Stethoscope className="w-3.5 h-3.5" />} label="Medical License" value={doctor.qualification} />
                <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={doctor.phone} />
                <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={doctor.email} />
                <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Location" value={`${doctor.address}, ${doctor.city}, ${doctor.state} ${doctor.pincode}`} />
                <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="DOB" value={doctor.dateOfBirth} />
                <InfoRow icon={<span className="text-[10px] font-bold">B+</span>} label="Blood Group" value={bgDisplay} />
                <InfoRow icon={<Clock className="w-3.5 h-3.5" />} label="Experience" value={`${doctor.experience}+ Years`} />
                <InfoRow icon={<span className="text-[10px] font-bold">G</span>} label="Gender" value={doctor.gender === 'MALE' ? 'Male' : doctor.gender === 'FEMALE' ? 'Female' : 'Other'} />
              </div>

              {doctor.languages.length > 0 && (
                <div className="bg-subtle/40 rounded-xl p-4 border border-border">
                  <h3 className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.languages.map(l => (
                      <span key={l} className="bg-card text-ink text-xs font-medium px-2.5 py-1 rounded-full border border-border">{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- Shared Sub-Components ----------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-px flex-1 bg-border" />
        <h3 className="text-xs font-semibold text-warm-gray uppercase tracking-wider">{title}</h3>
        <div className="h-px flex-1 bg-border" />
      </div>
      {children}
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, type, cls }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; cls?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-warm-gray mb-1.5">{label}</label>
      <input type={type || 'text'} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className={`w-full px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all ${cls || ''}`} />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-xs font-medium text-warm-gray mb-1.5">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-base border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all">
        <option value="">Select</option>
        {options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
      </select>
    </div>
  )
}

function DetailSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-teal">{icon}</span>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-warm-gray shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-warm-gray uppercase tracking-wider">{label}</p>
        <p className="text-sm text-ink font-medium truncate">{value}</p>
      </div>
    </div>
  )
}

// ---------- End Doctor Management ----------

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
