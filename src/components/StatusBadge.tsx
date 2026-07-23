'use client'

interface StatusBadgeProps {
  label: string
  variant: 'teal' | 'blue' | 'amber' | 'purple' | 'red' | 'green'
}

const variants = {
  teal: { bg: 'bg-teal-light', text: 'text-teal' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  red: { bg: 'bg-critical-light', text: 'text-critical' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
}

export default function StatusBadge({ label, variant }: StatusBadgeProps) {
  const v = variants[variant]
  return (
    <span className={`${v.bg} ${v.text} px-2 py-0.5 rounded-full text-[10px] font-medium leading-4`}>
      {label}
    </span>
  )
}
