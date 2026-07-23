'use client'

interface ChipProps {
  text: string
  critical?: boolean
}

export default function Chip({ text, critical }: ChipProps) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        critical ? 'bg-critical-light text-critical' : 'bg-subtle text-ink'
      }`}
    >
      {text}
    </span>
  )
}
