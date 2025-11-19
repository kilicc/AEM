import { Navbar } from './Navbar'
import { getCurrentUser } from '@/modules/auth/actions'

interface LayoutProps {
  children: React.ReactNode
}

export async function Layout({ children }: LayoutProps) {
  const user = await getCurrentUser()

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={user.role} userName={user.name} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

