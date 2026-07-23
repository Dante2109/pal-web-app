import { getEmergencyProfile } from '@/lib/api'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { QRCodeDisplay } from '@/components/QRCode'

export default async function QRPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Try fetching as emergency ID first, then as profile ID
  let profile = await getEmergencyProfile(id)

  if (!profile) {
    notFound()
  }

  const emergencyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mediguardian-ai-kdeo.onrender.com'}/emergency/${profile.emergencyId}`
  const displayName = `${profile.firstName} ${profile.lastName || ''}`.trim()
  const bloodDisplay = profile.bloodGroup
    ? profile.bloodGroup.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : null

  return (
    <div className="flex-1 bg-base">
      <div className="px-6 py-6 pb-24 max-w-md mx-auto">
        <div className="text-center space-y-3 mb-6">
          <h1 className="text-2xl font-bold text-ink">Emergency Access</h1>
          <p className="text-sm text-warm-gray leading-relaxed">
            Emergency staff can scan this code to access medical profile instantly.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="bg-white rounded-xl p-4 border border-border">
            <QRCodeDisplay value={emergencyUrl} size={200} />
          </div>

          <div className="text-center">
            <p className="text-xs font-mono text-ink tracking-wider">{profile.emergencyId}</p>
            <p className="text-xs text-warm-gray">Emergency ID</p>
          </div>
        </div>

        <div className="bg-teal-light rounded-xl px-5 py-4 mt-4 space-y-1">
          <p className="text-xs font-semibold text-teal uppercase tracking-wider">Patient</p>
          <p className="text-base font-medium text-ink">{displayName}</p>
          <div className="flex gap-3 text-sm text-warm-gray">
            {bloodDisplay && <span>Blood: {bloodDisplay}</span>}
            {profile.dateOfBirth && <span>DOB: {profile.dateOfBirth}</span>}
          </div>
          {profile.allergies && profile.allergies.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm">⚠️</span>
              <span className="text-xs text-critical">Allergies: {profile.allergies.join(', ')}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Link
            href={`/emergency/${profile.emergencyId}`}
            className="flex-1 bg-teal text-white text-center py-3 rounded-xl font-semibold text-sm hover:bg-teal/90 transition-colors"
          >
            Emergency Profile
          </Link>
        </div>

        <p className="text-xs text-warm-gray text-center mt-6 leading-relaxed">
          Scan the QR code to access the emergency dashboard. No login required.
        </p>
      </div>
    </div>
  )
}
