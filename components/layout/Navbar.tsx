'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from '@/modules/auth/actions'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { LanguageToggle } from '@/components/i18n/LanguageToggle'

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
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all">
                AEM
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden md:block w-64">
              <GlobalSearch />
            </div>
            <ThemeToggle />
            <LanguageToggle />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800">
              {userName}
            </span>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm" className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700">
                Çıkış
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}

