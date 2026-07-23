import { getEmergencyProfile } from '@/lib/api'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EmergencyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await getEmergencyProfile(id)

  if (!profile) {
    notFound()
  }

  const displayName = `${profile.firstName} ${profile.lastName || ''}`.trim()

  const bloodDisplay = profile.bloodGroup
    ? profile.bloodGroup.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : null

  return (
    <div className="flex-1 bg-base">
      {/* Critical header banner */}
      <div className="bg-critical-light border-b border-red-200 px-6 py-3 flex items-center gap-3">
        <span className="text-2xl">🆘</span>
        <div>
          <h1 className="text-sm font-bold text-critical uppercase tracking-wider">Emergency Medical Profile</h1>
          <p className="text-xs text-critical/70">Public access · No login required</p>
        </div>
      </div>

      <div className="px-6 py-4 pb-24 space-y-4 max-w-lg mx-auto">
        {/* Patient Identity */}
        <div className="bg-card border-2 border-critical/30 rounded-xl p-5 text-center space-y-2">
          <div className="w-20 h-20 bg-critical-light rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-ink">{displayName}</h2>
          <div className="flex items-center justify-center gap-3 text-sm text-warm-gray">
            {profile.dateOfBirth && <span>DOB: {profile.dateOfBirth}</span>}
            {profile.gender && (
              <>
                <span className="w-1 h-1 rounded-full bg-warm-gray" />
                <span>{profile.gender.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
              </>
            )}
          </div>
          {bloodDisplay && (
            <div className="inline-block bg-teal-light rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-teal font-mono">{bloodDisplay}</span>
            </div>
          )}
          <p className="text-xs text-warm-gray font-mono">Emergency ID: {profile.emergencyId}</p>
        </div>

        {/* Emergency Contacts — top for first responders */}
        {profile.emergencyContacts && profile.emergencyContacts.length > 0 && (
          <div className="bg-card border-2 border-teal/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📞</span>
              <h3 className="text-sm font-bold text-teal uppercase tracking-wider">Emergency Contact</h3>
            </div>
            <div className="space-y-2">
              {profile.emergencyContacts.map((ec, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-bold text-ink">{ec.contactName}</p>
                    <p className="text-xs text-warm-gray">{ec.contactRelationship}</p>
                  </div>
                  <a href={`tel:${ec.contactPhone}`} className="bg-teal text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-teal/90 transition-colors shrink-0">
                    <span className="text-sm">📞</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chief Complaint / Recent Cause */}
        {profile.conditions && profile.conditions.length > 0 && (
          <div className="bg-card border-2 border-critical/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🚨</span>
              <h3 className="text-sm font-bold text-critical uppercase tracking-wider">Recent Cause / Chief Complaint</h3>
            </div>
            <p className="text-sm font-medium text-ink">{profile.conditions[0]}</p>
            {profile.conditions.length > 1 && (
              <p className="text-xs text-warm-gray mt-1">+ {profile.conditions.length - 1} other condition{profile.conditions.length > 2 ? 's' : ''}</p>
            )}
          </div>
        )}

        {/* Vitals */}
        {(profile.height || profile.weight) && (
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-bold text-teal uppercase tracking-wider mb-2">Vitals</h3>
            <div className="flex gap-4 text-sm">
              {profile.height && <span className="text-ink">Height: {profile.height} cm</span>}
              {profile.weight && <span className="text-ink">Weight: {profile.weight} kg</span>}
            </div>
          </div>
        )}

        {/* Critical Alert — Allergies */}
        {profile.allergies && profile.allergies.length > 0 && (
          <div className="bg-critical-light border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⚠️</span>
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
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🏥</span>
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Chronic Conditions</h3>
            </div>
            <div className="space-y-1">
              {profile.conditions.map(c => <p key={c} className="text-sm text-ink">• {c}</p>)}
            </div>
          </div>
        )}

        {/* Current Medications */}
        {profile.medications && profile.medications.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💊</span>
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Current Medications</h3>
            </div>
            <div className="space-y-1">
              {profile.medications.map(m => <p key={m} className="text-sm text-ink">• {m}</p>)}
            </div>
          </div>
        )}

        {/* Surgeries */}
        {profile.surgeries && profile.surgeries.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🔧</span>
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Surgical History</h3>
            </div>
            <div className="space-y-1">
              {profile.surgeries.map(s => <p key={s} className="text-sm text-ink">• {s}</p>)}
            </div>
          </div>
        )}

        {/* Implants & Devices */}
        {(profile.implants?.length || profile.medicalDevices?.length) ? (
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-bold text-teal uppercase tracking-wider mb-2">Implants & Devices</h3>
            {profile.implants?.map(i => <p key={i} className="text-sm text-ink py-0.5">🔩 {i}</p>)}
            {profile.medicalDevices?.map(d => <p key={d} className="text-sm text-ink py-0.5">⌚ {d}</p>)}
          </div>
        ) : null}

        {/* Primary Doctor */}
        {profile.primaryDoctor && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🩺</span>
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Primary Doctor</h3>
            </div>
            <p className="text-sm font-medium text-ink">{profile.primaryDoctor.doctorName}</p>
            {profile.primaryDoctor.doctorHospital && (
              <p className="text-xs text-warm-gray">{profile.primaryDoctor.doctorHospital}</p>
            )}
            {profile.primaryDoctor.doctorPhone && (
              <a href={`tel:${profile.primaryDoctor.doctorPhone}`} className="text-sm text-teal font-medium mt-1 inline-block">
                📞 {profile.primaryDoctor.doctorPhone}
              </a>
            )}
          </div>
        )}

        {/* Lifestyle */}
        {profile.lifestyle && (
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-bold text-teal uppercase tracking-wider mb-2">Lifestyle</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {profile.lifestyle.smoking && (
                <div><span className="text-warm-gray text-xs">Smoking</span><p className="text-ink font-medium capitalize">{profile.lifestyle.smoking.toLowerCase()}</p></div>
              )}
              {profile.lifestyle.alcohol && (
                <div><span className="text-warm-gray text-xs">Alcohol</span><p className="text-ink font-medium capitalize">{profile.lifestyle.alcohol.toLowerCase()}</p></div>
              )}
              {profile.lifestyle.exercise && (
                <div><span className="text-warm-gray text-xs">Exercise</span><p className="text-ink font-medium capitalize">{profile.lifestyle.exercise.toLowerCase()}</p></div>
              )}
            </div>
          </div>
        )}

        {/* Vaccinations */}
        {profile.vaccinations && profile.vaccinations.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-bold text-teal uppercase tracking-wider mb-2">Vaccinations</h3>
            <div className="space-y-1">
              {profile.vaccinations.map(v => <p key={v} className="text-sm text-ink">• {v}</p>)}
            </div>
          </div>
        )}

        {/* Family History */}
        {profile.familyHistory && profile.familyHistory.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-bold text-teal uppercase tracking-wider mb-2">Family History</h3>
            <div className="space-y-1">
              {profile.familyHistory.map(h => <p key={h} className="text-sm text-ink">• {h}</p>)}
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
