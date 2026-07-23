'use client'

interface ScreenHeaderProps {
  title: string
  subtitle?: string
}

export default function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  return (
    <div className="px-6 pt-6 pb-4">
      <h1 className="text-xl font-bold text-ink">{title}</h1>
      {subtitle && <p className="text-sm text-warm-gray mt-0.5">{subtitle}</p>}
    </div>
  )
}
