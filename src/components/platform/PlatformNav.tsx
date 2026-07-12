'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { UserRole } from '@prisma/client'

type NavUser = {
  id: string
  email: string
  role: UserRole
  firstName?: string | null
  lastName?: string | null
}

function getNavLinks(role: UserRole) {
  if (role === 'INVESTOR') return [
    { href: '/app/investor/dashboard', label: 'Dashboard' },
    { href: '/app/offerings', label: 'Browse' },
    { href: '/app/investor/portfolio', label: 'Portfolio' },
    { href: '/app/investor/watchlist', label: 'Watchlist' },
  ]
  if (role === 'ISSUER') return [
    { href: '/app/issuer/dashboard', label: 'Dashboard' },
    { href: '/app/issuer/offerings/new', label: 'Create Offering' },
  ]
  if (role === 'BD_PARTNER') return [
    { href: '/app/bd/dashboard', label: 'Dashboard' },
    { href: '/app/bd/offerings', label: 'Offerings' },
    { href: '/app/bd/investors', label: 'Investors' },
  ]
  if (role === 'ADMIN') return [
    { href: '/app/admin/dashboard', label: 'Dashboard' },
    { href: '/app/offerings', label: 'All Offerings' },
  ]
  return []
}

export default function PlatformNav({ user }: { user: NavUser }) {
  const pathname = usePathname()
  const links = getNavLinks(user.role)

  return (
    <nav className="bg-white border-b border-[#e5e7f0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/app/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: '#5271ff' }}>S</div>
            <span className="font-bold text-gray-900 text-sm">SpaceFunding</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link key={link.href} href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith(link.href) ? 'bg-[#eef0ff] text-[#5271ff]' : 'text-gray-600 hover:text-gray-900 hover:bg-[#f8f9fc]'}`}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/app/settings" className="text-sm text-gray-600 hover:text-gray-900">
            {user.firstName || user.email.split('@')[0]}
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/app/login' })}
            className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-[#f8f9fc]">
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
