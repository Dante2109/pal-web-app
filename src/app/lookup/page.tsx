'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, Download, Printer, X, Phone, QrCode, AlertTriangle, User, Calendar } from 'lucide-react'
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
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-teal rounded-full animate-spin" />
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
      window.print()
    } finally {
      setDownloading(false)
    }
  }

  const blood = formatBlood(result?.bloodGroup)

  return (
    <div className="flex-1 bg-white">
      {(!hasAutoId || !result) && (
      <div className="px-4 sm:px-6 py-12 sm:py-16 text-center max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Emergency Profile</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Enter a patient&apos;s Emergency ID to access their critical medical information.
          No login required.
        </p>
        <div className="mt-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={emergencyId}
              onChange={e => setEmergencyId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
              placeholder="Paste Emergency ID (UUID)"
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 font-mono"
              autoFocus
            />
            <button
              onClick={handleLookup}
              disabled={loading || !emergencyId.trim()}
              className="bg-gray-900 text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors shrink-0 flex items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <><Search className="w-4 h-4" /> Search</>}
            </button>
          </div>
        </div>
      </div>
      )}

      <div className="px-4 py-6 max-w-xl mx-auto space-y-5">
        {error && (
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">{error}</p>
              <p className="text-xs text-gray-500 mt-0.5">Verify the UUID and try again.</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="py-10 text-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500 mt-3">Loading profile...</p>
          </div>
        )}

        {searched && !loading && !error && !result && (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-500 font-medium">No patient found</p>
            <p className="text-xs text-gray-400 mt-1">Double-check the Emergency ID and try again.</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Action bar */}
            <div className="flex items-center gap-3 print:hidden">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {downloading ? (
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                ) : <Download className="w-4 h-4" />}
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setEmergencyId(''); setResult(null); setSearched(false) }}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors ml-auto"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            </div>

            {/* Report */}
            <div ref={reportRef} className="bg-white">
              {/* Sticky Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 py-3 mb-6 print:relative">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Emergency Profile</span>
                </div>
              </div>

              {/* Hero Section */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {result.firstName} {result.lastName || ''}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    {result.dateOfBirth && <span>{result.dateOfBirth}</span>}
                    {result.gender && <span>{formatGender(result.gender)}</span>}
                  </div>
                  {blood && (
                    <div className="mt-2">
                      <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded tracking-wider">{blood}</span>
                    </div>
                  )}
                </div>
                {result.mobile && (
                  <a href={`tel:${result.mobile}`} className="shrink-0 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <Phone className="w-5 h-5 text-gray-700" />
                  </a>
                )}
              </div>

              <div className="text-xs text-gray-400 font-mono mb-6 pb-4 border-b border-gray-200">{result.emergencyId}</div>

              {/* Critical Alerts */}
              {(result.conditions?.length || result.allergies?.length) ? (
                <div className="bg-red-50 rounded-lg px-4 py-3 mb-6">
                  {result.allergies && result.allergies.length > 0 && (
                    <div className="mb-3 last:mb-0">
                      <p className="text-xs font-semibold text-red-700 mb-1.5">Allergies</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.allergies.map(a => (
                          <span key={a} className="text-sm font-medium text-red-800">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.conditions && result.conditions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-700 mb-1.5">Chief Complaint</p>
                      <p className="text-sm font-medium text-red-800">{result.conditions[0]}</p>
                      {result.conditions.length > 1 && (
                        <p className="text-xs text-red-600 mt-0.5">+ {result.conditions.length - 1} more</p>
                      )}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Emergency Contacts */}
              {result.emergencyContacts && result.emergencyContacts.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Emergency Contact</p>
                  <div className="space-y-2">
                    {result.emergencyContacts.map((ec, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ec.contactName}</p>
                          <p className="text-xs text-gray-500">{ec.contactRelationship}</p>
                        </div>
                        <a href={`tel:${ec.contactPhone}`} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0">
                          <Phone className="w-4 h-4 text-gray-700" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical Details Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {(result.height || result.weight) && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Vitals</p>
                    <div className="space-y-0.5">
                      {result.height && <p className="text-sm text-gray-900">{result.height} cm</p>}
                      {result.weight && <p className="text-sm text-gray-900">{result.weight} kg</p>}
                      {result.height && result.weight && (
                        <p className="text-sm text-gray-900">BMI: {(result.weight / ((result.height / 100) ** 2)).toFixed(1)}</p>
                      )}
                    </div>
                  </div>
                )}

                {result.medications && result.medications.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Medications</p>
                    <div className="space-y-0.5">
                      {result.medications.map(m => <p key={m} className="text-sm text-gray-900">{m}</p>)}
                    </div>
                  </div>
                )}

                {result.surgeries && result.surgeries.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Surgical History</p>
                    <div className="space-y-0.5">
                      {result.surgeries.map(s => <p key={s} className="text-sm text-gray-900">{s}</p>)}
                    </div>
                  </div>
                )}

                {((result.implants?.length ?? 0) > 0 || (result.medicalDevices?.length ?? 0) > 0) && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Implants & Devices</p>
                    <div className="space-y-0.5">
                      {result.implants?.map(i => <p key={i} className="text-sm text-gray-900">{i}</p>)}
                      {result.medicalDevices?.map(d => <p key={d} className="text-sm text-gray-900">{d}</p>)}
                    </div>
                  </div>
                )}

                {result.vaccinations && result.vaccinations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Vaccinations</p>
                    <div className="space-y-0.5">
                      {result.vaccinations.map(v => <p key={v} className="text-sm text-gray-900">{v}</p>)}
                    </div>
                  </div>
                )}

                {result.familyHistory && result.familyHistory.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Family History</p>
                    <div className="space-y-0.5">
                      {result.familyHistory.map(h => <p key={h} className="text-sm text-gray-900">{h}</p>)}
                    </div>
                  </div>
                )}

                {result.lifestyle && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Lifestyle</p>
                    <div className="space-y-0.5">
                      {result.lifestyle.smoking && <p className="text-sm text-gray-900 capitalize">Smoking: {result.lifestyle.smoking.toLowerCase()}</p>}
                      {result.lifestyle.alcohol && <p className="text-sm text-gray-900 capitalize">Alcohol: {result.lifestyle.alcohol.toLowerCase()}</p>}
                      {result.lifestyle.exercise && <p className="text-sm text-gray-900 capitalize">Exercise: {result.lifestyle.exercise.toLowerCase()}</p>}
                    </div>
                  </div>
                )}

                {result.primaryDoctor && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Primary Doctor</p>
                    <p className="text-sm font-medium text-gray-900">{result.primaryDoctor.doctorName}</p>
                    {result.primaryDoctor.doctorHospital && <p className="text-xs text-gray-500">{result.primaryDoctor.doctorHospital}</p>}
                    {result.primaryDoctor.doctorPhone && (
                      <a href={`tel:${result.primaryDoctor.doctorPhone}`} className="text-sm text-gray-700 inline-flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {result.primaryDoctor.doctorPhone}
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-4 mt-6 text-center">
                <p className="text-xs text-gray-400">
                  PAL &middot; {new Date().toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  For emergency medical use only.
                </p>
              </div>
            </div>

            <div className="flex gap-2 print:hidden pt-2">
              <Link
                href={`/qr/${result.emergencyId}`}
                className="flex items-center justify-center gap-2 flex-1 border border-gray-200 text-gray-700 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <QrCode className="w-4 h-4" /> QR Code
              </Link>
            </div>
          </div>
        )}

        {!hasAutoId && !result && !searched && (
          <div className="text-sm text-gray-500 space-y-2 leading-relaxed">
            <p>&bull; The Emergency ID is found on the patient&apos;s QR code or medical ID card</p>
            <p>&bull; Publicly accessible for emergency responders</p>
            <p>&bull; Displays allergies, conditions, medications, and emergency contacts</p>
          </div>
        )}
      </div>
    </div>
  )
}
