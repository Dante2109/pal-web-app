import { getPatient } from '@/lib/mockData'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const patient = getPatient(id)

  if (!patient) notFound()

  return (
    <div className="flex-1 bg-base">
      <div className="px-6 py-6 pb-24 space-y-4 max-w-lg mx-auto">
        {/* Profile Card */}
        <div className="bg-card border-2 border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-teal flex items-center justify-center shrink-0">
              <span className="text-2xl text-white">👤</span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-ink">{patient.name}</h1>
              <p className="text-xs text-warm-gray">{patient.gender} · {patient.age} yrs</p>
            </div>
            <div className="w-14 h-14 rounded-lg bg-white border border-border flex items-center justify-center">
              <span className="text-xl font-bold text-teal font-mono">{patient.bloodGroup}</span>
            </div>
          </div>

          {patient.height && patient.weight && (
            <div className="flex gap-4 text-sm">
              <span className="text-ink font-semibold">{patient.height} <span className="font-normal text-warm-gray">cm</span></span>
              <span className="text-border">|</span>
              <span className="text-ink font-semibold">{patient.weight} <span className="font-normal text-warm-gray">kg</span></span>
              <span className="text-border">|</span>
              <span className="text-ink font-semibold">
                {(Number(patient.weight) / ((Number(patient.height) / 100) ** 2)).toFixed(1)} <span className="font-normal text-warm-gray">BMI</span>
              </span>
            </div>
          )}

          {patient.allergies.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">⚠️</span>
                <span className="text-xs font-semibold text-critical uppercase tracking-wider">Allergies</span>
              </div>
              <p className="text-sm font-medium text-ink">{patient.allergies.join(', ')}</p>
            </div>
          )}

          {patient.conditions.length > 0 && (
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-warm-gray uppercase tracking-wider">Chronic Conditions</span>
              <p className="text-sm text-ink">{patient.conditions.join(', ')}</p>
            </div>
          )}

          {patient.medications.length > 0 && (
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-warm-gray uppercase tracking-wider">Medications</span>
              <p className="text-sm text-ink">{patient.medications.join(', ')}</p>
            </div>
          )}

          {patient.primaryDoctor && (
            <div className="border-t border-border pt-3 space-y-0.5">
              <span className="text-xs font-semibold text-warm-gray uppercase tracking-wider">Primary Doctor</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">🩺</span>
                <span className="text-sm text-ink">{patient.primaryDoctor.doctorName}</span>
                {patient.primaryDoctor.doctorHospital && (
                  <span className="text-xs text-warm-gray">— {patient.primaryDoctor.doctorHospital}</span>
                )}
              </div>
              <a href={`tel:${patient.primaryDoctor.doctorPhone}`} className="text-sm text-teal font-medium ml-6">
                📞 {patient.primaryDoctor.doctorPhone}
              </a>
            </div>
          )}

          {patient.emergencyContacts && patient.emergencyContacts.length > 0 && (
            <div className="border-t border-border pt-3 space-y-1.5">
              <span className="text-xs font-semibold text-warm-gray uppercase tracking-wider">Emergency Contacts</span>
              {patient.emergencyContacts.map((ec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm">👤</span>
                  <span className="text-sm text-ink flex-1">{ec.contactName} ({ec.contactRelationship})</span>
                  <a href={`tel:${ec.contactPhone}`} className="bg-teal text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-teal/90 transition-colors">
                    <span className="text-xs">📞</span>
                  </a>
                </div>
              ))}
            </div>
          )}

          <Link
            href={`/qr/${patient.id}`}
            className="flex items-center gap-3 pt-3 border-t border-border"
          >
            <div className="w-10 h-10 bg-white border border-border rounded flex items-center justify-center">
              <span className="text-lg">📱</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">Personal Emergency QR</p>
              <p className="text-xs text-warm-gray">First responders can scan for instant medical access.</p>
            </div>
            <span className="text-warm-gray">→</span>
          </Link>
        </div>

        {/* Medical History */}
        {(patient.surgeries.length > 0 || patient.implants.length > 0 || patient.medicalDevices?.length || patient.vaccinations?.length) && (
          <div className="bg-card border border-border rounded-xl p-4">
            <span className="text-xs font-bold text-teal uppercase tracking-wider block mb-2">Medical History</span>
            {patient.surgeries.map(s => <p key={s} className="text-sm text-ink py-0.5">🔧 Surgery: {s}</p>)}
            {patient.implants.map(s => <p key={s} className="text-sm text-ink py-0.5">🔩 Implant: {s}</p>)}
            {patient.medicalDevices?.map(d => <p key={d} className="text-sm text-ink py-0.5">⌚ Device: {d}</p>)}
            {patient.vaccinations?.map(v => <p key={v} className="text-sm text-ink py-0.5">💉 Vaccination: {v}</p>)}
          </div>
        )}

        {/* Family History */}
        {patient.familyHistory && patient.familyHistory.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <span className="text-xs font-bold text-teal uppercase tracking-wider block mb-2">Family History</span>
            {patient.familyHistory.map(h => <p key={h} className="text-sm text-ink py-0.5">• {h}</p>)}
          </div>
        )}

        {/* Lifestyle */}
        {patient.lifestyle && (
          <div className="bg-card border border-border rounded-xl p-4">
            <span className="text-xs font-bold text-teal uppercase tracking-wider block mb-2">Lifestyle</span>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-warm-gray text-xs">Smoking</span>
                <p className="text-ink font-medium capitalize">{patient.lifestyle.smoking}</p>
              </div>
              <div>
                <span className="text-warm-gray text-xs">Alcohol</span>
                <p className="text-ink font-medium capitalize">{patient.lifestyle.alcohol}</p>
              </div>
              <div>
                <span className="text-warm-gray text-xs">Exercise</span>
                <p className="text-ink font-medium capitalize">{patient.lifestyle.exercise}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reports */}
        {patient.reports.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <span className="text-xs font-bold text-teal uppercase tracking-wider block mb-2">Recent Reports</span>
            <div className="space-y-2">
              {patient.reports.map(r => (
                <div key={r.id} className="flex items-center gap-2 py-1">
                  <span className="text-sm">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{r.type}</p>
                    <p className="text-xs text-warm-gray truncate">{r.date} · {r.summary.slice(0, 60)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {patient.timeline.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <span className="text-xs font-bold text-teal uppercase tracking-wider block mb-2">Timeline</span>
            <div className="space-y-2">
              {patient.timeline.map(t => (
                <div key={t.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-teal mt-1.5" />
                    <div className="w-px flex-1 bg-border" />
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium text-ink">{t.title}</p>
                    <p className="text-xs text-warm-gray">{t.date}</p>
                    <p className="text-xs text-ink/70 mt-0.5">{t.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <Link href={`/qr/${patient.id}`} className="bg-teal text-white text-center py-3 rounded-xl font-semibold text-sm hover:bg-teal/90 transition-colors">
            🩻 Show QR
          </Link>
          <Link href={`/emergency/${patient.id}`} className="bg-critical text-white text-center py-3 rounded-xl font-semibold text-sm hover:bg-critical/90 transition-colors">
            🆘 Emergency View
          </Link>
        </div>
      </div>
    </div>
  )
}
