import { getEmergencyProfile } from '@/lib/api'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlertTriangle, Phone, User, Stethoscope, Pill, Activity, HeartPulse, Syringe, Dna, IdCard } from 'lucide-react'

export default async function EmergencyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getEmergencyProfile(id)

  if (!profile) {
    notFound()
  }

  const displayName = `${profile.firstName} ${profile.lastName || ''}`.trim()

  const age = profile.dateOfBirth
    ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  const bloodDisplay = profile.bloodGroup
    ? profile.bloodGroup.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : null

  return (
    <div className="flex-1 bg-base">
      {/* Critical header banner */}
      <div className="bg-critical-light border-b border-red-200 px-6 py-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-critical rounded-lg flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-critical uppercase tracking-wider">Emergency Medical Profile</h1>
          <p className="text-xs text-critical/70">Public access &middot; No login required</p>
        </div>
      </div>

      <div className="px-6 py-4 pb-24 space-y-4 max-w-lg mx-auto">
        {/* Patient Identity */}
        <div className="bg-card border-2 border-critical/30 rounded-xl p-5 text-center space-y-3">
          <div className="w-20 h-20 bg-critical-light rounded-full flex items-center justify-center mx-auto">
            <User className="w-10 h-10 text-critical" />
          </div>
          <h2 className="text-2xl font-bold text-ink">{displayName}</h2>
          <div className="flex items-center justify-center gap-3 text-sm text-warm-gray">
            {age && <span>Age: {age} yrs</span>}
            {profile.gender && (
              <>
                <span className="w-1 h-1 rounded-full bg-warm-gray" />
                <span>{profile.gender.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
              </>
            )}
          </div>
          {bloodDisplay && (
            <div className="inline-flex items-center gap-2 bg-teal-light rounded-lg px-5 py-2">
              <HeartPulse className="w-5 h-5 text-teal" />
              <span className="text-xl font-bold text-teal font-mono">{bloodDisplay}</span>
            </div>
          )}
          <div className="flex items-center justify-center gap-1.5 text-xs text-warm-gray">
            <IdCard className="w-3.5 h-3.5" />
            <span className="font-mono">ID: {profile.emergencyId}</span>
          </div>
        </div>

        {/* Emergency Contacts — top for first responders */}
        {profile.emergencyContacts && profile.emergencyContacts.length > 0 && (
          <div className="bg-card border-2 border-teal/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-teal rounded-lg flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-teal uppercase tracking-wider">Emergency Contact</h3>
            </div>
            <div className="space-y-2">
              {profile.emergencyContacts.map((ec, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-ink">{ec.contactName}</p>
                    <p className="text-xs text-warm-gray">{ec.contactRelationship}</p>
                  </div>
                  <a href={`tel:${ec.contactPhone}`} className="bg-teal text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-teal/90 transition-colors shrink-0">
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chief Complaint / Recent Cause */}
        {profile.conditions && profile.conditions.length > 0 && (
          <div className="bg-critical-light border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-critical rounded-lg flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-critical uppercase tracking-wider">Chief Complaint</h3>
            </div>
            <p className="text-sm font-semibold text-ink">{profile.conditions[0]}</p>
            {profile.conditions.length > 1 && (
              <p className="text-xs text-warm-gray mt-1">+ {profile.conditions.length - 1} other condition{profile.conditions.length > 2 ? 's' : ''}</p>
            )}
          </div>
        )}

        {/* Vitals */}
        {(profile.height || profile.weight) && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-teal rounded-lg flex items-center justify-center shrink-0">
                <Activity className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="text-xs font-bold text-teal uppercase tracking-wider">Vitals</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {profile.height && (
                <div className="bg-subtle rounded-lg p-3 text-center">
                  <p className="text-xs text-warm-gray">Height</p>
                  <p className="text-sm font-bold text-ink">{profile.height} cm</p>
                </div>
              )}
              {profile.weight && (
                <div className="bg-subtle rounded-lg p-3 text-center">
                  <p className="text-xs text-warm-gray">Weight</p>
                  <p className="text-sm font-bold text-ink">{profile.weight} kg</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Critical Alert — Allergies */}
        {profile.allergies && profile.allergies.length > 0 && (
          <div className="bg-critical-light border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-critical rounded-lg flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-critical uppercase tracking-wider">Allergies</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.allergies.map(a => (
                <span key={a} className="bg-white border border-red-200 text-critical px-3 py-1 rounded-full text-sm font-medium">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chronic Conditions */}
        {profile.conditions && profile.conditions.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                <Stethoscope className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Chronic Conditions</h3>
            </div>
            <div className="space-y-1.5">
              {profile.conditions.map(c => (
                <div key={c} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                  <p className="text-sm text-ink">{c}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Medications */}
        {profile.medications && profile.medications.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <Pill className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Current Medications</h3>
            </div>
            <div className="space-y-1.5">
              {profile.medications.map(m => (
                <div key={m} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                  <p className="text-sm text-ink">{m}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Surgeries */}
        {profile.surgeries && profile.surgeries.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                <Activity className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Surgical History</h3>
            </div>
            <div className="space-y-1.5">
              {profile.surgeries.map(s => (
                <div key={s} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 shrink-0" />
                  <p className="text-sm text-ink">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Implants & Devices */}
        {(profile.implants?.length || profile.medicalDevices?.length) ? (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <Activity className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Implants &amp; Devices</h3>
            </div>
            <div className="space-y-1.5">
              {profile.implants?.map(i => (
                <p key={i} className="text-sm text-ink flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" /> {i}
                </p>
              ))}
              {profile.medicalDevices?.map(d => (
                <p key={d} className="text-sm text-ink flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" /> {d}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {/* Primary Doctor */}
        {profile.primaryDoctor && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-teal rounded-lg flex items-center justify-center shrink-0">
                <Stethoscope className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Primary Doctor</h3>
            </div>
            <p className="text-sm font-semibold text-ink">{profile.primaryDoctor.doctorName}</p>
            {profile.primaryDoctor.doctorHospital && (
              <p className="text-xs text-warm-gray mt-0.5">{profile.primaryDoctor.doctorHospital}</p>
            )}
            {profile.primaryDoctor.doctorPhone && (
              <a href={`tel:${profile.primaryDoctor.doctorPhone}`} className="text-sm text-teal font-medium mt-2 inline-flex items-center gap-1.5 hover:underline">
                <Phone className="w-3.5 h-3.5" />
                {profile.primaryDoctor.doctorPhone}
              </a>
            )}
          </div>
        )}

        {/* Lifestyle */}
        {profile.lifestyle && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Lifestyle</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {profile.lifestyle.smoking && (
                <div className="bg-subtle rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-warm-gray uppercase tracking-wider">Smoking</p>
                  <p className="text-sm font-semibold text-ink capitalize mt-0.5">{profile.lifestyle.smoking.toLowerCase()}</p>
                </div>
              )}
              {profile.lifestyle.alcohol && (
                <div className="bg-subtle rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-warm-gray uppercase tracking-wider">Alcohol</p>
                  <p className="text-sm font-semibold text-ink capitalize mt-0.5">{profile.lifestyle.alcohol.toLowerCase()}</p>
                </div>
              )}
              {profile.lifestyle.exercise && (
                <div className="bg-subtle rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-warm-gray uppercase tracking-wider">Exercise</p>
                  <p className="text-sm font-semibold text-ink capitalize mt-0.5">{profile.lifestyle.exercise.toLowerCase()}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vaccinations */}
        {profile.vaccinations && profile.vaccinations.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                <Syringe className="w-3.5 h-3.5 text-green-600" />
              </div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Vaccinations</h3>
            </div>
            <div className="space-y-1.5">
              {profile.vaccinations.map(v => (
                <div key={v} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 shrink-0" />
                  <p className="text-sm text-ink">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Family History */}
        {profile.familyHistory && profile.familyHistory.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center shrink-0">
                <Dna className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Family History</h3>
            </div>
            <div className="space-y-1.5">
              {profile.familyHistory.map(h => (
                <div key={h} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-1.5 shrink-0" />
                  <p className="text-sm text-ink">{h}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            href={`/qr/${profile.profileId}`}
            className="flex-1 bg-card border border-teal text-teal text-center py-3 rounded-xl font-semibold text-sm hover:bg-teal-light transition-colors"
          >
            Show QR Code
          </Link>
        </div>

        <p className="text-[10px] text-warm-gray text-center pt-2">
          This emergency profile is publicly accessible for first responders.
        </p>
      </div>
    </div>
  )
}
