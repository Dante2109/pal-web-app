'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
  icon: string
  label: string
  section: string
}

const navItems: Record<string, NavItem[]> = {
  DOCTOR: [
    { icon: 'LayoutDashboard', label: 'Dashboard', section: 'profile' },
    { icon: 'Search', label: 'Patient Lookup', section: 'lookup' },
    { icon: 'FileText', label: 'Medical Records', section: 'records' },
    { icon: 'Brain', label: 'AI Analysis', section: 'ai' },
    { icon: 'Bell', label: 'Notifications', section: 'notifications' },
  ],
  HOSPITAL: [
    { icon: 'Stethoscope', label: 'Doctors', section: 'doctors' },
    { icon: 'Search', label: 'Search Patient', section: 'search' },
    { icon: 'Smartphone', label: 'QR Scan History', section: 'scan' },
    { icon: 'AlertTriangle', label: 'Emergency Lookup', section: 'lookup' },
    { icon: 'Baby', label: 'Newborn Registration', section: 'newborn' },
  ],
}

export default function DashboardSidebar({ activeSection, onSectionChange }: {
  activeSection?: string
  onSectionChange?: (section: string) => void
}) {
  const { role, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const items = role ? navItems[role] ?? [] : []

  const initials = role?.slice(0, 2).toUpperCase() ?? 'PL'

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center shadow-sm"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen w-64
        bg-card border-r border-border
        flex flex-col
        transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-border shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal rounded-xl flex items-center justify-center shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-ink leading-tight">PAL</p>
              <p className="text-[10px] text-warm-gray leading-tight">Emergency Medical Profile</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-[10px] font-semibold text-warm-gray uppercase tracking-wider px-3 mb-2">Main Menu</p>
          <div className="space-y-0.5">
            {items.map(item => {
              const isActive = activeSection === item.section || (!activeSection && item.section === 'profile')
              return (
                <button
                  key={item.section}
                  onClick={() => {
                    onSectionChange?.(item.section)
                    setMobileOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-teal text-white shadow-sm'
                      : 'text-warm-gray hover:bg-subtle hover:text-ink'
                    }
                  `}
                >
                  <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                    <NavIcon name={item.icon} />
                  </span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-6">
            <p className="text-[10px] font-semibold text-warm-gray uppercase tracking-wider px-3 mb-2">Quick Links</p>
            <div className="space-y-0.5">
              <Link
                href="/lookup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-warm-gray hover:bg-subtle hover:text-ink transition-all duration-150"
              >
                <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                Emergency Lookup
              </Link>
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="px-3 py-3 border-t border-border shrink-0">
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg">
            <div className="w-8 h-8 bg-teal-light rounded-lg flex items-center justify-center text-teal text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink truncate capitalize">{role?.toLowerCase()}</p>
              <p className="text-[10px] text-warm-gray truncate">{role === 'DOCTOR' ? 'Doctor' : 'Hospital Staff'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-warm-gray hover:bg-subtle hover:text-critical transition-all duration-150 w-full mt-1"
          >
            <span className="shrink-0 w-5 h-5 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

function NavIcon({ name }: { name: string }) {
  const size = 18
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round' as const }
  const icons: Record<string, React.ReactNode> = {
    LayoutDashboard: <svg {...props}><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>,
    Search: <svg {...props}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    FileText: <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    Brain: <svg {...props}><path d="M12 4.5a5.5 5.5 0 0 1 5.5 5.5c0 2-1.5 3.5-2.5 4.5v3a1.5 1.5 0 0 1-3 0v-3c-1-1-2.5-2.5-2.5-4.5A5.5 5.5 0 0 1 12 4.5z" /><path d="M12 2v2.5" /><path d="M8 4.5 6.5 6" /><path d="M16 4.5 17.5 6" /></svg>,
    Bell: <svg {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    Smartphone: <svg {...props}><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
    Baby: <svg {...props}><path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" /><path d="M6 14a6 6 0 0 1 12 0" /><circle cx="9" cy="9" r=".5" /><circle cx="15" cy="9" r=".5" /></svg>,
    AlertTriangle: <svg {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    Stethoscope: <svg {...props}><path d="M4 8V6a4 4 0 0 1 8 0v2" /><path d="M4 12a4 4 0 0 0 8 0" /><path d="M16 8h1a3 3 0 0 1 3 3v1a6 6 0 0 1-6 6h-2" /><circle cx="16" cy="8" r="3" /></svg>,
  }
  return icons[name] || null
}
