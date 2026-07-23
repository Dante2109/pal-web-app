import { getPatient } from '@/lib/mockData'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { User, Phone, AlertTriangle, Stethoscope, Pill, Activity, Dna, Syringe, HeartPulse, Shield, QrCode, FileText, Clock } from 'lucide-react'

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const patient = getPatient(id)

  if (!patient) notFound()

  const typeColors: Record<string, string> = {
    diagnosis: 'bg-blue-50 text-blue-600',
    surgery: 'bg-purple-50 text-purple-600',
    hospitalization: 'bg-amber-50 text-amber-600',
    test: 'bg-cyan-50 text-cyan-600',
    vaccination: 'bg-green-50 text-green-600',
    other: 'bg-slate-50 text-slate-600',
  }

  const typeIcons: Record<string, React.ReactNode> = {
    diagnosis: <Stethoscope className="w-3.5 h-3.5" />,
    surgery: <Activity className="w-3.5 h-3.5" />,
    hospitalization: <AlertTriangle className="w-3.5 h-3.5" />,
    test: <FileText className="w-3.5 h-3.5" />,
    vaccination: <Syringe className="w-3.5 h-3.5" />,
    other: <Clock className="w-3.5 h-3.5" />,
  }

  return (
    <div className="flex-1 bg-base">
      <div className="px-6 py-6 pb-24 space-y-4 max-w-lg mx-auto">
        {/* Profile Card */}
        <div className="bg-card border-2 border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-teal flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-ink">{patient.name}</h1>
              <p className="text-xs text-warm-gray">{patient.gender} &middot; {patient.age} yrs</p>
            </div>
            <div className="w-14 h-14 rounded-lg bg-white border-2 border-teal/20 flex items-center justify-center">
              <span className="text-lg font-bold text-teal font-mono">{patient.bloodGroup}</span>
            </div>
          </div>

          {patient.height && patient.weight && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-subtle rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-warm-gray uppercase">Height</p>
                <p className="text-sm font-bold text-ink">{patient.height} <span className="font-normal text-warm-gray text-xs">cm</span></p>
              </div>
              <div className="bg-subtle rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-warm-gray uppercase">Weight</p>
                <p className="text-sm font-bold text-ink">{patient.weight} <span className="font-normal text-warm-gray text-xs">kg</span></p>
              </div>
              <div className="bg-subtle rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-warm-gray uppercase">BMI</p>
                <p className="text-sm font-bold text-ink">{(Number(patient.weight) / ((Number(patient.height) / 100) ** 2)).toFixed(1)}</p>
              </div>
            </div>
          )}

          {patient.allergies.length > 0 && (
            <div className="bg-critical-light border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-critical" />
                <span className="text-xs font-bold text-critical uppercase tracking-wider">Allergies</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {patient.allergies.map(a => (
                  <span key={a} className="bg-white border border-red-200 text-critical text-xs font-medium px-2.5 py-0.5 rounded-full">{a}</span>
                ))}
              </div>
            </div>
          )}

          {patient.conditions.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-warm-gray uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-3 h-3" /> Chronic Conditions
              </span>
              <p className="text-sm text-ink">{patient.conditions.join(', ')}</p>
            </div>
          )}

          {patient.medications.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-warm-gray uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-3 h-3" /> Current Medications
              </span>
              <p className="text-sm text-ink">{patient.medications.join(', ')}</p>
            </div>
          )}

          {patient.primaryDoctor && (
            <div className="border-t border-border pt-3 space-y-1.5">
              <span className="text-xs font-bold text-warm-gray uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-3 h-3" /> Primary Doctor
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">{patient.primaryDoctor.doctorName}</span>
                {patient.primaryDoctor.doctorHospital && (
                  <span className="text-xs text-warm-gray">&mdash; {patient.primaryDoctor.doctorHospital}</span>
                )}
              </div>
              <a href={`tel:${patient.primaryDoctor.doctorPhone}`} className="text-sm text-teal font-medium inline-flex items-center gap-1.5 hover:underline">
                <Phone className="w-3.5 h-3.5" /> {patient.primaryDoctor.doctorPhone}
              </a>
            </div>
          )}

          {patient.emergencyContacts && patient.emergencyContacts.length > 0 && (
            <div className="border-t border-border pt-3 space-y-1.5">
              <span className="text-xs font-bold text-warm-gray uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> Emergency Contacts
              </span>
              {patient.emergencyContacts.map((ec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <User className="w-4 h-4 text-warm-gray shrink-0" />
                  <span className="text-sm text-ink flex-1">{ec.contactName} <span className="text-warm-gray">({ec.contactRelationship})</span></span>
                  <a href={`tel:${ec.contactPhone}`} className="bg-teal text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-teal/90 transition-colors shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}

          <Link
            href={`/qr/${patient.id}`}
            className="flex items-center gap-3 pt-3 border-t border-border group"
          >
            <div className="w-10 h-10 bg-white border border-border rounded-lg flex items-center justify-center group-hover:border-teal/30 transition-colors">
              <QrCode className="w-5 h-5 text-ink" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">Personal Emergency QR</p>
              <p className="text-xs text-warm-gray">First responders can scan for instant medical access.</p>
            </div>
            <span className="text-warm-gray group-hover:text-teal transition-colors">&rarr;</span>
          </Link>
        </div>

        {/* Medical History */}
        {(patient.surgeries.length > 0 || patient.implants.length > 0 || patient.medicalDevices?.length || patient.vaccinations?.length) && (
          <div className="bg-card border border-border rounded-xl p-4">
            <span className="text-xs font-bold text-teal uppercase tracking-wider block mb-3">Medical History</span>
            <div className="space-y-1.5">
              {patient.surgeries.map(s => (
                <p key={s} className="text-sm text-ink flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  Surgery: {s}
                </p>
              ))}
              {patient.implants.map(i => (
                <p key={i} className="text-sm text-ink flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  Implant: {i}
                </p>
              ))}
              {patient.medicalDevices?.map(d => (
                <p key={d} className="text-sm text-ink flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  Device: {d}
                </p>
              ))}
              {patient.vaccinations?.map(v => (
                <p key={v} className="text-sm text-ink flex items-center gap-2">
                  <Syringe className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  Vaccination: {v}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Family History */}
        {patient.familyHistory && patient.familyHistory.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Dna className="w-3.5 h-3.5 text-rose-500" /> Family History
            </span>
            <div className="space-y-1.5">
              {patient.familyHistory.map(h => (
                <div key={h} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-1.5 shrink-0" />
                  <p className="text-sm text-ink">{h}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lifestyle */}
        {patient.lifestyle && (
          <div className="bg-card border border-border rounded-xl p-4">
            <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-500" /> Lifestyle
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-subtle rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-warm-gray uppercase tracking-wider">Smoking</p>
                <p className="text-sm font-semibold text-ink capitalize mt-0.5">{patient.lifestyle.smoking}</p>
              </div>
              <div className="bg-subtle rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-warm-gray uppercase tracking-wider">Alcohol</p>
                <p className="text-sm font-semibold text-ink capitalize mt-0.5">{patient.lifestyle.alcohol}</p>
              </div>
              <div className="bg-subtle rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-warm-gray uppercase tracking-wider">Exercise</p>
                <p className="text-sm font-semibold text-ink capitalize mt-0.5">{patient.lifestyle.exercise}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reports */}
        {patient.reports.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <FileText className="w-3.5 h-3.5 text-teal" /> Recent Reports
            </span>
            <div className="space-y-2">
              {patient.reports.map(r => (
                <div key={r.id} className="flex items-center gap-3 bg-subtle rounded-lg p-3">
                  <div className="w-8 h-8 bg-white border border-border rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{r.type}</p>
                    <p className="text-xs text-warm-gray truncate">{r.date} &middot; {r.summary.slice(0, 60)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {patient.timeline.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Clock className="w-3.5 h-3.5 text-teal" /> Timeline
            </span>
            <div className="space-y-0">
              {patient.timeline.map(t => (
                <div key={t.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-teal mt-1.5 ring-2 ring-card" />
                    <div className="w-px flex-1 bg-border" />
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${typeColors[t.type] || typeColors.other}`}>
                        {typeIcons[t.type] || null}
                        {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                      </span>
                      <span className="text-[10px] text-warm-gray">{t.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-ink">{t.title}</p>
                    {t.description && <p className="text-xs text-ink/70 mt-0.5">{t.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <Link href={`/qr/${patient.id}`} className="bg-teal text-white text-center py-3 rounded-xl font-semibold text-sm hover:bg-teal/90 transition-colors inline-flex items-center justify-center gap-2">
            <QrCode className="w-4 h-4" /> Show QR
          </Link>
          <Link href={`/emergency/${patient.id}`} className="bg-critical text-white text-center py-3 rounded-xl font-semibold text-sm hover:bg-critical/90 transition-colors inline-flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" /> Emergency View
          </Link>
        </div>
      </div>
    </div>
  )
}
