import { getEmergencyProfile } from '@/lib/api'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Phone } from 'lucide-react'

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
    <div className="flex-1 bg-white max-w-xl mx-auto px-4 sm:px-6">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 py-3 mb-6 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600" />
          <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Emergency Profile</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{displayName}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
            {age && <span>{age} yrs</span>}
            {profile.gender && (
              <span>{profile.gender.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
            )}
          </div>
          {bloodDisplay && (
            <div className="mt-2">
              <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded tracking-wider">{bloodDisplay}</span>
            </div>
          )}
        </div>
        {profile.mobile && (
          <a href={`tel:${profile.mobile}`} className="shrink-0 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <Phone className="w-5 h-5 text-gray-700" />
          </a>
        )}
      </div>

      <div className="text-xs text-gray-400 font-mono mb-6 pb-4 border-b border-gray-200">{profile.emergencyId}</div>

      {/* Critical Alerts */}
      {(profile.conditions?.length || profile.allergies?.length) ? (
        <div className="bg-red-50 rounded-lg px-4 py-3 mb-6">
          {profile.allergies && profile.allergies.length > 0 && (
            <div className="mb-3 last:mb-0">
              <p className="text-xs font-semibold text-red-700 mb-1.5">Allergies</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.allergies.map(a => (
                  <span key={a} className="text-sm font-medium text-red-800">{a}</span>
                ))}
              </div>
            </div>
          )}
          {profile.conditions && profile.conditions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-700 mb-1.5">Chief Complaint</p>
              <p className="text-sm font-medium text-red-800">{profile.conditions[0]}</p>
              {profile.conditions.length > 1 && (
                <p className="text-xs text-red-600 mt-0.5">+ {profile.conditions.length - 1} more</p>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Emergency Contacts */}
      {profile.emergencyContacts && profile.emergencyContacts.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 mb-2">Emergency Contact</p>
          <div className="space-y-2">
            {profile.emergencyContacts.map((ec, i) => (
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
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-8">
        {(profile.height || profile.weight) && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Vitals</p>
            <div className="space-y-0.5">
              {profile.height && <p className="text-sm text-gray-900">{profile.height} cm</p>}
              {profile.weight && <p className="text-sm text-gray-900">{profile.weight} kg</p>}
            </div>
          </div>
        )}

        {profile.medications && profile.medications.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Medications</p>
            <div className="space-y-0.5">
              {profile.medications.map(m => <p key={m} className="text-sm text-gray-900">{m}</p>)}
            </div>
          </div>
        )}

        {profile.surgeries && profile.surgeries.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Surgical History</p>
            <div className="space-y-0.5">
              {profile.surgeries.map(s => <p key={s} className="text-sm text-gray-900">{s}</p>)}
            </div>
          </div>
        )}

        {(profile.implants?.length || profile.medicalDevices?.length) ? (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Implants & Devices</p>
            <div className="space-y-0.5">
              {profile.implants?.map(i => <p key={i} className="text-sm text-gray-900">{i}</p>)}
              {profile.medicalDevices?.map(d => <p key={d} className="text-sm text-gray-900">{d}</p>)}
            </div>
          </div>
        ) : null}

        {profile.vaccinations && profile.vaccinations.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Vaccinations</p>
            <div className="space-y-0.5">
              {profile.vaccinations.map(v => <p key={v} className="text-sm text-gray-900">{v}</p>)}
            </div>
          </div>
        )}

        {profile.familyHistory && profile.familyHistory.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Family History</p>
            <div className="space-y-0.5">
              {profile.familyHistory.map(h => <p key={h} className="text-sm text-gray-900">{h}</p>)}
            </div>
          </div>
        )}

        {profile.lifestyle && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Lifestyle</p>
            <div className="space-y-0.5">
              {profile.lifestyle.smoking && <p className="text-sm text-gray-900 capitalize">Smoking: {profile.lifestyle.smoking.toLowerCase()}</p>}
              {profile.lifestyle.alcohol && <p className="text-sm text-gray-900 capitalize">Alcohol: {profile.lifestyle.alcohol.toLowerCase()}</p>}
              {profile.lifestyle.exercise && <p className="text-sm text-gray-900 capitalize">Exercise: {profile.lifestyle.exercise.toLowerCase()}</p>}
            </div>
          </div>
        )}

        {profile.primaryDoctor && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Primary Doctor</p>
            <p className="text-sm font-medium text-gray-900">{profile.primaryDoctor.doctorName}</p>
            {profile.primaryDoctor.doctorHospital && <p className="text-xs text-gray-500">{profile.primaryDoctor.doctorHospital}</p>}
            {profile.primaryDoctor.doctorPhone && (
              <a href={`tel:${profile.primaryDoctor.doctorPhone}`} className="text-sm text-gray-700 inline-flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" /> {profile.primaryDoctor.doctorPhone}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Link
          href={`/qr/${profile.profileId}`}
          className="flex-1 border border-gray-200 text-gray-700 text-center py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Show QR Code
        </Link>
      </div>

      <p className="text-xs text-gray-400 text-center py-4">
        Publicly accessible for first responders.
      </p>
    </div>
  )
}
