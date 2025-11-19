'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from '@/modules/auth/actions'

interface NavbarProps {
  userRole?: 'admin' | 'user'
  userName?: string
}

export function Navbar({ userRole, userName }: NavbarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const adminLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/modules/depo', label: 'Depo' },
    { href: '/modules/musteri', label: 'Müşteriler' },
    { href: '/modules/is-emri/yeni', label: 'Yeni İş Emri' },
    { href: '/modules/is-emri', label: 'İş Emirleri' },
    { href: '/modules/fatura', label: 'Faturalar' },
    { href: '/modules/admin', label: 'Ayarlar' },
  ]

  const userLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/modules/is-emri', label: 'İş Emirlerim' },
    { href: '/modules/is-emri/takvim', label: 'Takvim' },
  ]

  const links = userRole === 'admin' ? adminLinks : userLinks

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                AEM
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive(link.href)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{userName}</span>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Çıkış
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}

