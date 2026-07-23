'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import * as api from '@/lib/api'
import type { EmergencyProfileResponse } from '@/lib/api'

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

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
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
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = searchParams.get('emergencyId')
    if (!id) return
    setLoading(true)
    api.getEmergencyProfile(id).then(data => {
      if (data) setResult(data)
      else setError('No patient found with that Emergency ID.')
    }).catch(() => {
      setError('Network error. Please try again.')
    }).finally(() => {
      setLoading(false)
      setSearched(true)
    })
  }, [])

  async function handleLookup() {
    const id = emergencyId.trim()
    if (!id) return
    setLoading(true); setError(''); setResult(null); setSearched(true)
    try {
      const data = await api.getEmergencyProfile(id)
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
      // fallback to print
      window.print()
    } finally {
      setDownloading(false)
    }
  }

  const blood = formatBlood(result?.bloodGroup)

  return (
    <div className="flex-1 bg-base">
      {/* Hero — hidden when auto-loaded from ?emergencyId */}
      {(!hasAutoId || !result) && (
      <div className="bg-gradient-to-br from-teal to-teal/90 px-6 py-10 text-center">
        <div className="max-w-lg mx-auto space-y-3">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur shadow-lg">
            <span className="text-3xl">🆘</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Emergency Profile Lookup</h1>
          <p className="text-sm text-teal-light/80 leading-relaxed max-w-sm mx-auto">
            Enter a patient&apos;s Emergency ID to instantly access their critical medical information.
            No login required — built for first responders.
          </p>
        </div>
      </div>
      )}

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-5">
        {/* Search Input — hidden when auto-loaded with result */}
        {(!hasAutoId || !result) && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm -mt-2 relative z-10">
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
              className="bg-teal text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-teal/90 disabled:opacity-50 transition-colors shrink-0 flex items-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Searching</>
              ) : '🔍 Search'}
            </button>
          </div>
        </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-critical-light border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-lg shrink-0 mt-0.5">⚠️</span>
            <div>
              <p className="text-sm font-medium text-critical">{error}</p>
              <p className="text-xs text-critical/70 mt-1">Verify the UUID (e.g., 8dd5b143-7336-4822-8c09-1063baed2846).</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-card border border-border rounded-2xl p-10 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-teal/20 border-t-teal rounded-full animate-spin mx-auto" />
            <p className="text-sm text-warm-gray">Fetching emergency profile...</p>
          </div>
        )}

        {/* No results */}
        {searched && !loading && !error && !result && (
          <div className="bg-card border border-border rounded-2xl p-10 text-center space-y-3">
            <div className="w-16 h-16 bg-subtle rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🔍</span>
            </div>
            <p className="text-sm text-warm-gray font-medium">No patient found</p>
            <p className="text-xs text-warm-gray">Double-check the Emergency ID and try again.</p>
          </div>
        )}

        {/* ============ RESULTS ============ */}
        {result && (
          <div className="space-y-4">
            {/* Download / Actions bar */}
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-ink/90 disabled:opacity-50 transition-colors"
              >
                {downloading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Exporting...</>
                ) : (
                  <><span className="text-base">⬇️</span> Download PDF</>
                )}
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-card border border-border px-5 py-2.5 rounded-xl text-sm font-semibold text-ink hover:bg-subtle transition-colors"
              >
                🖨️ Print
              </button>
              <button
                onClick={() => { setEmergencyId(''); setResult(null); setSearched(false) }}
                className="flex items-center gap-2 bg-card border border-border px-5 py-2.5 rounded-xl text-sm font-semibold text-warm-gray hover:bg-subtle transition-colors ml-auto"
              >
                ✕ Clear
              </button>
            </div>

            {/* ===== PRINTABLE REPORT ===== */}
            <div
              ref={reportRef}
              className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden print:shadow-none print:border-0 print:rounded-none"
            >
              {/* Print-only header */}
              <div className="hidden print:block text-center py-4 border-b border-gray-200 mb-4">
                <p className="text-xs text-gray-500">MediGuardian · Emergency Medical Profile · Generated {new Date().toLocaleString()}</p>
              </div>

              {/* ===== Patient Identity Header ===== */}
              <div className="bg-gradient-to-r from-teal/5 to-teal/10 border-b border-border px-6 py-5 print:px-4 print:py-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-teal rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
                    {result.firstName[0]}{result.lastName?.[0] || ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-ink truncate">
                      {result.firstName} {result.lastName || ''}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-warm-gray mt-0.5">
                      {result.dateOfBirth && <span>📅 {result.dateOfBirth}</span>}
                      {result.gender && <span>⚧ {formatGender(result.gender)}</span>}
                      {result.mobile && <span>📱 {result.mobile}</span>}
                    </div>
                  </div>
                  {blood && (
                    <div className="shrink-0 bg-teal-light rounded-xl px-4 py-2.5 border border-teal/20 text-center">
                      <p className="text-[10px] text-teal font-semibold uppercase tracking-wider leading-tight">Blood</p>
                      <p className="text-xl font-bold text-teal font-mono tracking-wider">{blood}</p>
                    </div>
                  )}
                </div>
                {/* Emergency ID badge */}
                <div className="mt-3 flex items-center gap-2 bg-white/60 rounded-lg px-3 py-1.5 border border-border/50">
                  <span className="text-[10px] text-warm-gray font-medium uppercase tracking-wider">Emergency ID</span>
                  <span className="text-xs font-mono text-ink font-medium tracking-tight">{result.emergencyId}</span>
                </div>
              </div>

              <div className="px-6 py-5 print:px-4 print:py-4 space-y-5">
                {/* ===== ALLERGIES (critical highlight) ===== */}
                {result.allergies && result.allergies.length > 0 && (
                  <div className="bg-critical-light/60 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 bg-critical rounded-full flex items-center justify-center text-white text-xs font-bold">!</span>
                      <h3 className="font-bold text-critical text-sm uppercase tracking-wider">Allergies</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.allergies.map(a => (
                        <span key={a} className="bg-white border border-red-200 text-critical px-3 py-1 rounded-full text-sm font-semibold shadow-xs">
                          ⚠ {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== Vitals Row ===== */}
                {(result.height || result.weight) && (
                  <div className="bg-subtle/60 rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">Vitals</h3>
                    <div className="flex gap-6">
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

                {/* ===== Conditions & Medications (2-col grid) ===== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.conditions && result.conditions.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-sm">🏥</span>
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
                        <span className="w-7 h-7 bg-teal-light rounded-lg flex items-center justify-center text-sm">💊</span>
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

                {/* ===== Surgical History ===== */}
                {result.surgeries && result.surgeries.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 bg-subtle rounded-lg flex items-center justify-center text-sm">🔧</span>
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

                {/* ===== Implants & Devices ===== */}
                {((result.implants?.length ?? 0) > 0 || (result.medicalDevices?.length ?? 0) > 0) && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 bg-subtle rounded-lg flex items-center justify-center text-sm">🔩</span>
                      <h3 className="font-semibold text-ink text-sm">Implants &amp; Medical Devices</h3>
                    </div>
                    <div className="space-y-1.5">
                      {result.implants?.map(i => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-warm-gray mt-2 shrink-0" />
                          <span className="text-sm text-ink">🔩 {i}</span>
                        </div>
                      ))}
                      {result.medicalDevices?.map(d => (
                        <div key={d} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-warm-gray mt-2 shrink-0" />
                          <span className="text-sm text-ink">⌚ {d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== Vaccinations ===== */}
                {result.vaccinations && result.vaccinations.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 bg-subtle rounded-lg flex items-center justify-center text-sm">💉</span>
                      <h3 className="font-semibold text-ink text-sm">Vaccinations</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.vaccinations.map(v => (
                        <span key={v} className="bg-subtle text-ink px-2.5 py-1 rounded-full text-xs">{v}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== Family History ===== */}
                {result.familyHistory && result.familyHistory.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 bg-subtle rounded-lg flex items-center justify-center text-sm">👨‍👩‍👧‍👦</span>
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

                {/* ===== Lifestyle ===== */}
                {result.lifestyle && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 bg-subtle rounded-lg flex items-center justify-center text-sm">🏃</span>
                      <h3 className="font-semibold text-ink text-sm">Lifestyle</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
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

                {/* ===== Primary Doctor ===== */}
                {result.primaryDoctor && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 bg-teal-light rounded-lg flex items-center justify-center text-sm">🩺</span>
                      <h3 className="font-semibold text-ink text-sm">Primary Doctor</h3>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-ink">{result.primaryDoctor.doctorName}</p>
                      {result.primaryDoctor.doctorHospital && (
                        <p className="text-xs text-warm-gray">🏥 {result.primaryDoctor.doctorHospital}</p>
                      )}
                      {result.primaryDoctor.doctorPhone && (
                        <a href={`tel:${result.primaryDoctor.doctorPhone}`} className="text-sm text-teal font-medium inline-flex items-center gap-1.5 hover:underline mt-0.5">
                          <PhoneIcon /> {result.primaryDoctor.doctorPhone}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* ===== Emergency Contacts ===== */}
                {result.emergencyContacts && result.emergencyContacts.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 bg-critical-light rounded-lg flex items-center justify-center"><PhoneIcon /></span>
                      <h3 className="font-semibold text-ink text-sm">Emergency Contacts</h3>
                      <span className="ml-auto bg-critical-light text-critical text-[10px] font-medium px-2 py-0.5 rounded-full">{result.emergencyContacts.length}</span>
                    </div>
                    <div className="space-y-2">
                      {result.emergencyContacts.map((ec, i) => (
                        <div key={i} className="flex items-center justify-between bg-critical-light/30 border border-red-100 rounded-xl p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-critical rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {ec.contactName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-ink">{ec.contactName}</p>
                              <p className="text-xs text-warm-gray">{ec.contactRelationship}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-warm-gray font-mono hidden sm:block">{ec.contactPhone}</span>
                            <a
                              href={`tel:${ec.contactPhone}`}
                              className="bg-teal text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-teal/90 transition-colors shrink-0 shadow-xs"
                              title={ec.contactPhone}
                            >
                              <PhoneIcon />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border px-6 py-3 text-center print:px-4 print:py-3">
                <p className="text-[10px] text-warm-gray">
                  Generated by MediGuardian · {new Date().toLocaleString()} · Emergency ID: {result.emergencyId}
                </p>
                <p className="text-[10px] text-warm-gray mt-0.5">
                  This information is intended for emergency medical use only.
                </p>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="flex gap-2 print:hidden">
              <Link
                href={`/qr/${result.emergencyId}`}
                className="flex items-center justify-center gap-2 flex-1 bg-card border border-teal text-teal py-3 rounded-xl font-semibold text-sm hover:bg-teal-light transition-colors"
              >
                🩻 Generate QR Code
              </Link>
            </div>
          </div>
        )}

        {/* Quick Tips — hidden when auto-loaded */}
        {!hasAutoId && !result && !searched && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-ink">ℹ️ Quick Tips</h3>
            <div className="space-y-2 text-xs text-warm-gray leading-relaxed">
              <p>• The Emergency ID is a <span className="font-medium text-ink">UUID</span> format found on the patient&apos;s QR code or medical ID card</p>
              <p>• This lookup is <span className="font-medium text-ink">publicly accessible</span> — designed for emergency responders</p>
              <p>• Displays allergies, conditions, medications, emergency contacts, and more</p>
              <p>• You can <span className="font-medium text-ink">download or print</span> the profile as a PDF for records</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
