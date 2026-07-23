'use client'

import Link from 'next/link'

interface QuickAction {
  icon: string
  label: string
  href: string
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map(action => (
        <Link
          key={action.label}
          href={action.href}
          className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-teal/30 transition-colors"
        >
          <span className="text-xl">{action.icon}</span>
          <span className="text-xs font-medium text-ink text-center leading-tight">{action.label}</span>
        </Link>
      ))}
    </div>
  )
}
