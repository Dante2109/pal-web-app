'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertTriangle, Search, Download, Printer, X, Phone, Stethoscope, Pill, Activity, Syringe, Dna, HeartPulse, QrCode, Shield, User, Bone, IdCard, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import * as api from '@/lib/api'
import type { EmergencyProfileResponse, MedicalMetric } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

function formatBlood(bg: string | undefined | null) {
  if (!bg) return null
  return bg.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatGender(g: string | undefined | null) {
  if (!g) return null
  return g.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function LookupPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal/20 border-t-teal rounded-full animate-spin" />
      </div>
    }>
      <LookupContent />
    </Suspense>
  )
}

function LookupContent() {
  const searchParams = useSearchParams()
  const hasAutoId = !!searchParams.get('emergencyId')
  const [emergencyId, setEmergencyId] = useState(searchParams.get('emergencyId') || '')
  const [result, setResult] = useState<EmergencyProfileResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [medicalMetrics, setMedicalMetrics] = useState<MedicalMetric[] | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const { token } = useAuth()

  function getTokenFromStorage(): string | undefined {
    if (token) return token
    return undefined
  }

  useEffect(() => {
    const id = searchParams.get('emergencyId')
    if (!id) return
    setLoading(true)
    const t = getTokenFromStorage()
    api.getEmergencyProfile(id, t).then(data => {
      if (data) setResult(data)
      else setError('No patient found with that Emergency ID.')
    }).catch(() => {
      setError('Network error. Please try again.')
    }).finally(() => {
      setLoading(false)
      setSearched(true)
    })
  }, [])

  useEffect(() => {
    if (!result?.profileId) return
    const t = getTokenFromStorage()
    setMetricsLoading(true)
    api.getMedicalData(result.profileId, t).then(data => {
      setMedicalMetrics(data)
    }).catch(() => {}).finally(() => setMetricsLoading(false))
  }, [result])

  async function handleLookup() {
    const id = emergencyId.trim()
    if (!id) return
    setLoading(true); setError(''); setResult(null); setSearched(true); setMedicalMetrics(null)
    try {
      const t = getTokenFromStorage()
      const data = await api.getEmergencyProfile(id, t)
      if (data) setResult(data)
      else setError('No patient found with that Emergency ID.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload() {
    if (!reportRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#FFFFFF',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `emergency-profile-${result?.emergencyId?.slice(0, 8) || 'export'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      window.print()
    } finally {
      setDownloading(false)
    }
  }

  const blood = formatBlood(result?.bloodGroup)

  return (
    <div className="flex-1 bg-base">
      {(!hasAutoId || !result) && (
      <div className="bg-gradient-to-br from-teal to-teal/90 px-4 sm:px-6 py-8 sm:py-10 text-center">
        <div className="max-w-lg mx-auto space-y-3">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Emergency Profile Lookup</h1>
          <p className="text-sm text-teal-light/80 leading-relaxed max-w-sm mx-auto">
            Enter a patient&apos;s Emergency ID to instantly access their critical medical information.
            No login required &mdash; built for first responders.
          </p>
        </div>
      </div>
      )}

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-5">
        {(!hasAutoId || !result) && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm -mt-2 relative z-10">
          <div className="flex gap-2">
            <input
              type="text"
              value={emergencyId}
              onChange={e => setEmergencyId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
              placeholder="Paste Emergency ID (UUID)"
              className="flex-1 px-4 py-3 bg-base border border-border rounded-xl text-sm text-ink placeholder:text-warm-gray focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/10 transition-all font-mono"
              autoFocus
            />
            <button
              onClick={handleLookup}
              disabled={loading || !emergencyId.trim()}
              className="bg-teal text-white px-3 sm:px-6 py-3 rounded-xl text-sm font-semibold hover:bg-teal/90 disabled:opacity-50 transition-colors shrink-0 flex items-center gap-1 sm:gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span className="hidden sm:inline"> Searching</span></>
              ) : <><Search className="w-4 h-4" /><span className="hidden sm:inline"> Search</span></>}
            </button>
          </div>
        </div>
        )}

        {error && (
          <div className="bg-critical-light border border-red-200 rounded-xl p-3 sm:p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-critical shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-critical">{error}</p>
              <p className="text-xs text-critical/70 mt-1">Verify the UUID (e.g., 8dd5b143-7336-4822-8c09-1063baed2846).</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-teal/20 border-t-teal rounded-full animate-spin mx-auto" />
            <p className="text-sm text-warm-gray">Fetching emergency profile...</p>
          </div>
        )}

        {searched && !loading && !error && !result && (
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 text-center space-y-3">
            <div className="w-16 h-16 bg-subtle rounded-full flex items-center justify-center mx-auto">
              <User className="w-7 h-7 text-warm-gray" />
            </div>
            <p className="text-sm text-warm-gray font-medium">No patient found</p>
            <p className="text-xs text-warm-gray">Double-check the Emergency ID and try again.</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 print:hidden">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center justify-center gap-2 bg-ink text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-ink/90 disabled:opacity-50 transition-colors"
              >
                {downloading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Exporting...</>
                ) : (
                  <><Download className="w-4 h-4" /> PDF</>
                )}
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 bg-card border border-border px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold text-ink hover:bg-subtle transition-colors"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                onClick={() => { setEmergencyId(''); setResult(null); setSearched(false) }}
                className="flex items-center justify-center gap-2 bg-card border border-border px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold text-warm-gray hover:bg-subtle transition-colors ml-auto sm:ml-auto"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            </div>

            <div
              ref={reportRef}
              className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden print:shadow-none print:border-0 print:rounded-none"
            >
              <div className="hidden print:block text-center py-4 border-b border-gray-200 mb-4">
                <p className="text-xs text-gray-500">PAL &middot; Emergency Medical Profile &middot; Generated {new Date().toLocaleString()}</p>
              </div>

              <div className="bg-gradient-to-r from-teal/5 to-teal/10 border-b border-border px-4 sm:px-6 py-5 sm:py-6 print:px-4 print:py-4 space-y-4">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-teal rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0 shadow-sm">
                    {result.firstName[0]}{result.lastName?.[0] || ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-ink">
                      {result.firstName} {result.lastName || ''}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-warm-gray mt-1">
                      {result.dateOfBirth && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {result.dateOfBirth}</span>}
                      {result.gender && <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {formatGender(result.gender)}</span>}
                      {result.mobile && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {result.mobile}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-1.5 border border-border/50">
                    <IdCard className="w-3.5 h-3.5 text-warm-gray" />
                    <span className="text-[10px] text-warm-gray font-medium uppercase tracking-wider">Emergency ID</span>
                    <span className="text-xs font-mono text-ink font-medium tracking-tight">{result.emergencyId}</span>
                  </div>
                  {blood && (
                    <div className="bg-teal-light rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 border border-teal/20 text-center">
                      <p className="text-[10px] text-teal font-semibold uppercase tracking-wider leading-tight">Blood</p>
                      <p className="text-base sm:text-lg font-bold text-teal font-mono tracking-wider">{blood}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 sm:px-6 py-4 sm:py-5 print:px-4 print:py-4 space-y-4 sm:space-y-5">
                {result.allergies && result.allergies.length > 0 && (
                  <div className="bg-critical-light/60 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-critical rounded-full flex items-center justify-center text-white">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-critical text-sm uppercase tracking-wider">Allergies</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.allergies.map(a => (
                        <span key={a} className="bg-white border border-red-200 text-critical px-3 py-1 rounded-full text-sm font-semibold shadow-xs">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(result.height || result.weight) && (
                  <div className="bg-subtle/60 rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">Vitals</h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                      {result.height && (
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-ink">{result.height}</span>
                          <span className="text-sm text-warm-gray">cm</span>
                        </div>
                      )}
                      {result.weight && (
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-ink">{result.weight}</span>
                          <span className="text-sm text-warm-gray">kg</span>
                        </div>
                      )}
                      {result.height && result.weight && (
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-ink">
                            {(result.weight / ((result.height / 100) ** 2)).toFixed(1)}
                          </span>
                          <span className="text-sm text-warm-gray">BMI</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.conditions && result.conditions.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                          <Stethoscope className="w-4 h-4 text-amber-600" />
                        </div>
                        <h3 className="font-semibold text-ink text-sm">Chronic Conditions</h3>
                        <span className="ml-auto bg-amber-50 text-amber-700 text-[10px] font-medium px-2 py-0.5 rounded-full">{result.conditions.length}</span>
                      </div>
                      <div className="space-y-1.5">
                        {result.conditions.map(c => (
                          <div key={c} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                            <span className="text-sm text-ink">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.medications && result.medications.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 bg-teal-light rounded-lg flex items-center justify-center">
                          <Pill className="w-4 h-4 text-teal" />
                        </div>
                        <h3 className="font-semibold text-ink text-sm">Medications</h3>
                        <span className="ml-auto bg-teal-light text-teal text-[10px] font-medium px-2 py-0.5 rounded-full">{result.medications.length}</span>
                      </div>
                      <div className="space-y-1.5">
                        {result.medications.map(m => (
                          <div key={m} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                            <span className="text-sm text-ink">{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {result.surgeries && result.surgeries.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-subtle rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-slate-600" />
                      </div>
                      <h3 className="font-semibold text-ink text-sm">Surgical History</h3>
                    </div>
                    <div className="space-y-1.5">
                      {result.surgeries.map(s => (
                        <div key={s} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-warm-gray mt-2 shrink-0" />
                          <span className="text-sm text-ink">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {((result.implants?.length ?? 0) > 0 || (result.medicalDevices?.length ?? 0) > 0) && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-subtle rounded-lg flex items-center justify-center">
                        <Bone className="w-4 h-4 text-slate-600" />
                      </div>
                      <h3 className="font-semibold text-ink text-sm">Implants &amp; Medical Devices</h3>
                    </div>
                    <div className="space-y-1.5">
                      {result.implants?.map(i => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-warm-gray mt-2 shrink-0" />
                          <span className="text-sm text-ink">{i}</span>
                        </div>
                      ))}
                      {result.medicalDevices?.map(d => (
                        <div key={d} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-warm-gray mt-2 shrink-0" />
                          <span className="text-sm text-ink">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.vaccinations && result.vaccinations.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-subtle rounded-lg flex items-center justify-center">
                        <Syringe className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-ink text-sm">Vaccinations</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.vaccinations.map(v => (
                        <span key={v} className="bg-subtle text-ink px-2.5 py-1 rounded-full text-xs">{v}</span>
                      ))}
                    </div>
                  </div>
                )}

                {metricsLoading && (
                  <div className="text-center py-4">
                    <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin inline-block" />
                  </div>
                )}
                {medicalMetrics && medicalMetrics.length > 0 && (
                  <div className="space-y-4">
                    {groupBy(medicalMetrics, 'metricType').map(([type, metrics]) => (
                      <div key={type} className="bg-card border border-border rounded-xl p-4">
                        <h3 className="font-semibold text-ink text-sm mb-3 capitalize">{type.replace(/_/g, ' ').toLowerCase()}</h3>
                        <div className="space-y-3">
                          {metrics.map(m => {
                            const flag = getFlag(m.metricValue, m.normalRange)
                            const range = parseRange(m.normalRange)
                            return (
                              <div key={m.id}>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-sm font-medium text-gray-900 truncate">{m.metricName}</span>
                                    {m.trendStatus !== 'UNKNOWN' && <TrendIcon status={m.trendStatus} />}
                                  </div>
                                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                                    flag === 'high' ? 'bg-red-100 text-red-700' :
                                    flag === 'low' ? 'bg-blue-100 text-blue-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {m.metricValue} {m.unit}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full relative overflow-hidden">
                                    {range && (
                                      <div className="absolute inset-y-0 rounded-full bg-green-200" style={{
                                        left: `${range.normalStart}%`,
                                        width: `${range.normalEnd - range.normalStart}%`,
                                      }} />
                                    )}
                                    {range && (
                                      <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-white shadow-sm" style={{
                                        left: `${range.valuePct}%`,
                                        backgroundColor: flag === 'high' ? '#dc2626' : flag === 'low' ? '#2563eb' : '#16a34a',
                                        transform: 'translate(-50%, -50%)',
                                      }} />
                                    )}
                                  </div>
                                  <span className="text-[10px] text-gray-400 shrink-0 w-14 text-right">{m.normalRange}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {result.familyHistory && result.familyHistory.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-subtle rounded-lg flex items-center justify-center">
                        <Dna className="w-4 h-4 text-rose-500" />
                      </div>
                      <h3 className="font-semibold text-ink text-sm">Family History</h3>
                    </div>
                    <div className="space-y-1.5">
                      {result.familyHistory.map(h => (
                        <div key={h} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-warm-gray mt-2 shrink-0" />
                          <span className="text-sm text-ink">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.lifestyle && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-subtle rounded-lg flex items-center justify-center">
                        <HeartPulse className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold text-ink text-sm">Lifestyle</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {result.lifestyle.smoking && (
                        <div className="bg-subtle/60 rounded-lg p-3 text-center">
                          <p className="text-[10px] text-warm-gray uppercase tracking-wider">Smoking</p>
                          <p className="text-sm font-semibold text-ink capitalize mt-0.5">{result.lifestyle.smoking.toLowerCase()}</p>
                        </div>
                      )}
                      {result.lifestyle.alcohol && (
                        <div className="bg-subtle/60 rounded-lg p-3 text-center">
                          <p className="text-[10px] text-warm-gray uppercase tracking-wider">Alcohol</p>
                          <p className="text-sm font-semibold text-ink capitalize mt-0.5">{result.lifestyle.alcohol.toLowerCase()}</p>
                        </div>
                      )}
                      {result.lifestyle.exercise && (
                        <div className="bg-subtle/60 rounded-lg p-3 text-center">
                          <p className="text-[10px] text-warm-gray uppercase tracking-wider">Exercise</p>
                          <p className="text-sm font-semibold text-ink capitalize mt-0.5">{result.lifestyle.exercise.toLowerCase()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {result.primaryDoctor && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-teal-light rounded-lg flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-teal" />
                      </div>
                      <h3 className="font-semibold text-ink text-sm">Primary Doctor</h3>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-ink">{result.primaryDoctor.doctorName}</p>
                      {result.primaryDoctor.doctorHospital && (
                        <p className="text-xs text-warm-gray flex items-center gap-1"><Stethoscope className="w-3 h-3" /> {result.primaryDoctor.doctorHospital}</p>
                      )}
                      {result.primaryDoctor.doctorPhone && (
                        <a href={`tel:${result.primaryDoctor.doctorPhone}`} className="text-sm text-teal font-medium inline-flex items-center gap-1.5 hover:underline mt-0.5">
                          <Phone className="w-3.5 h-3.5" /> {result.primaryDoctor.doctorPhone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {result.insuranceDetails?.providerName && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M12 9v6" /><path d="M9 12h6" /></svg>
                      </div>
                      <h3 className="font-semibold text-ink text-sm">Insurance</h3>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm text-ink"><span className="text-warm-gray">Provider:</span> {result.insuranceDetails.providerName}</p>
                      {result.insuranceDetails.policyNumber && (
                        <p className="text-sm text-ink"><span className="text-warm-gray">Policy:</span> <span className="font-mono">{result.insuranceDetails.policyNumber}</span></p>
                      )}
                      {result.insuranceDetails.groupId && (
                        <p className="text-sm text-ink"><span className="text-warm-gray">Group:</span> <span className="font-mono">{result.insuranceDetails.groupId}</span></p>
                      )}
                      {result.insuranceDetails.coverageType && (
                        <p className="text-sm text-ink"><span className="text-warm-gray">Coverage:</span> {result.insuranceDetails.coverageType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</p>
                      )}
                      {result.insuranceDetails.expirationDate && (
                        <p className="text-sm text-ink"><span className="text-warm-gray">Valid until:</span> {result.insuranceDetails.expirationDate}</p>
                      )}
                    </div>
                  </div>
                )}

                {result.emergencyContacts && result.emergencyContacts.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 bg-critical-light rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-critical" />
                      </div>
                      <h3 className="font-semibold text-ink text-sm">Emergency Contacts</h3>
                      <span className="ml-auto bg-critical-light text-critical text-[10px] font-medium px-2 py-0.5 rounded-full">{result.emergencyContacts.length}</span>
                    </div>
                    <div className="space-y-2">
                      {result.emergencyContacts.map((ec, i) => (
                      <div key={i} className="flex items-center justify-between bg-critical-light/30 border border-red-100 rounded-xl p-3 sm:p-3.5 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="w-8 h-8 bg-critical rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {ec.contactName[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink truncate">{ec.contactName}</p>
                            <p className="text-xs text-warm-gray truncate">{ec.contactRelationship}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          <span className="text-xs sm:text-sm text-warm-gray font-mono hidden sm:block">{ec.contactPhone}</span>
                          <a
                            href={`tel:${ec.contactPhone}`}
                            className="bg-teal text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-teal/90 transition-colors shrink-0 shadow-xs"
                            title={ec.contactPhone}
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border px-4 sm:px-6 py-3 text-center print:px-4 print:py-3">
                <p className="text-[10px] text-warm-gray">
                  Generated by PAL &middot; {new Date().toLocaleString()} &middot; Emergency ID: {result.emergencyId}
                </p>
                <p className="text-[10px] text-warm-gray mt-0.5">
                  This information is intended for emergency medical use only.
                </p>
              </div>
            </div>


          </div>
        )}

        {!hasAutoId && !result && !searched && (
          <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-warm-gray" /> Quick Tips
            </h3>
            <div className="space-y-2 text-xs text-warm-gray leading-relaxed">
              <p>&bull; The Emergency ID is a <span className="font-medium text-ink">UUID</span> format found on the patient&apos;s QR code or medical ID card</p>
              <p>&bull; This lookup is <span className="font-medium text-ink">publicly accessible</span> &mdash; designed for emergency responders</p>
              <p>&bull; Displays allergies, conditions, medications, emergency contacts, and more</p>
              <p>&bull; You can <span className="font-medium text-ink">download or print</span> the profile as a PDF for records</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getFlag(value: string, normalRange: string): 'high' | 'low' | 'normal' {
  const v = parseFloat(value)
  if (isNaN(v)) return 'normal'
  const parts = normalRange.replace(/[<>=]/g, '').split('-').map(s => parseFloat(s.trim()))
  if (parts.length === 1 && !isNaN(parts[0])) {
    if (normalRange.includes('<')) return v < parts[0] ? 'normal' : 'high'
    if (normalRange.includes('>')) return v > parts[0] ? 'normal' : 'low'
  }
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    if (v < parts[0]) return 'low'
    if (v > parts[1]) return 'high'
    return 'normal'
  }
  return 'normal'
}

function groupBy<T>(arr: T[], key: keyof T): [string, T[]][] {
  const map: Record<string, T[]> = {}
  arr.forEach(item => {
    const k = String(item[key])
    if (!map[k]) map[k] = []
    map[k].push(item)
  })
  return Object.entries(map)
}

function parseRange(normalRange: string): { normalStart: number; normalEnd: number; valuePct: number } | null {
  const parts = normalRange.replace(/[<>=]/g, '').split('-').map(s => parseFloat(s.trim()))
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] < parts[1]) {
    const margin = (parts[1] - parts[0]) * 0.5
    const min = parts[0] - margin
    const max = parts[1] + margin
    return {
      normalStart: ((parts[0] - min) / (max - min)) * 100,
      normalEnd: ((parts[1] - min) / (max - min)) * 100,
      valuePct: 50,
    }
  }
  return null
}

function TrendIcon({ status }: { status: string }) {
  if (status === 'IMPROVING') return (
    <svg width="20" height="12" viewBox="0 0 20 12" fill="none" className="shrink-0">
      <path d="M0 10 L5 6 L10 8 L15 2 L20 4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
  if (status === 'DETERIORATING') return (
    <svg width="20" height="12" viewBox="0 0 20 12" fill="none" className="shrink-0">
      <path d="M0 2 L5 6 L10 4 L15 10 L20 8" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
  if (status === 'STABLE') return (
    <svg width="20" height="12" viewBox="0 0 20 12" fill="none" className="shrink-0">
      <path d="M0 6 L7 6 L13 6 L20 6" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
  return null
}
