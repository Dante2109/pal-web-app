'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function NavBar() {
  const { isAuthenticated, role, logout } = useAuth()

  if (role === 'DOCTOR' || role === 'HOSPITAL') {
    return null
  }

  if (!isAuthenticated) {
    return (
      <nav className="bg-card border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <span className="font-bold text-ink text-sm">MediGuardian</span>
        </Link>
        <div className="flex flex-col items-end gap-0.5">
          <Link href="/login" className="text-xs text-warm-gray hover:text-teal transition-colors">
            Sign In
          </Link>
          <Link href="/lookup" className="bg-critical text-white text-[10px] font-semibold px-2 py-0.5 rounded hover:bg-critical/90 transition-colors">
            🆘 Emergency Lookup
          </Link>
        </div>
      </nav>
    )
  }

  const roleLinks: Record<string, { href: string; label: string }[]> = {
    DOCTOR: [{ href: '/doctor', label: 'Dashboard' }],
    HOSPITAL: [{ href: '/hospital', label: 'Dashboard' }],
    USER: [{ href: '/', label: 'Home' }],
    LAB: [{ href: '/', label: 'Home' }],
    ADMIN: [{ href: '/doctor', label: 'Doctor' }, { href: '/hospital', label: 'Hospital' }],
  }

  return (
    <nav className="bg-card border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <span className="font-bold text-ink text-sm">MediGuardian</span>
        </Link>
        <span className="bg-teal-light text-teal text-[10px] font-semibold px-2 py-0.5 rounded-full ml-1 uppercase">
          {role}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/lookup" className="text-xs text-warm-gray hover:text-teal transition-colors">
          🔍 Lookup
        </Link>
        {role && roleLinks[role]?.map(link => (
          <Link key={link.href} href={link.href} className="text-xs text-warm-gray hover:text-teal transition-colors">
            {link.label}
          </Link>
        ))}
        <button onClick={logout} className="text-xs text-warm-gray hover:text-critical transition-colors">
          Sign Out
        </button>
      </div>
    </nav>
  )
}
