'use client'

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  color: string
}

export default function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="flex-1 bg-card border border-border rounded-xl p-3.5 flex flex-col items-center gap-1.5">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${color}1A` }}
      >
        <span className="text-sm" style={{ color }}>{icon}</span>
      </div>
      <span className="text-xl font-bold text-ink">{value}</span>
      <span className="text-xs text-warm-gray text-center">{label}</span>
    </div>
  )
}
