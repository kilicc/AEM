import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getDepots } from '@/modules/depo/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Move } from 'lucide-react'
import DepotTransferForm from './DepotTransferForm'

export const dynamic = 'force-dynamic'

export default async function AdminTransferPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  const depotsResult = await getDepots()
  const depots = depotsResult.data || []

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Move className="w-8 h-8 text-red-600" />
              Depo Transferi
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Depo arası ürün transferi</p>
          </div>

          <DepotTransferForm depots={depots} />
        </div>
      </div>
    </Layout>
  )
}

