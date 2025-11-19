import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect, notFound } from 'next/navigation'
import { getDepots } from '@/modules/depo/actions'
import { getProducts } from '@/modules/depo/actions'
import { getUsers } from '@/modules/admin/actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DepotProductsManager } from './DepotProductsManager'

export const dynamic = 'force-dynamic'

export default async function DepotDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  const depotsResult = await getDepots()
  const depots = depotsResult.data || []
  const depot = depots.find((d: any) => d.id === params.id)

  if (!depot) {
    notFound()
  }

  const productsResult = await getProducts(params.id)
  const products = productsResult.data || []

  const usersResult = await getUsers()
  const users = usersResult.data || []

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <Link
              href="/modules/depo"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Depolara Dön
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {depot.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {depot.address || 'Adres belirtilmemiş'}
                </p>
              </div>
            </div>
          </div>

          <DepotProductsManager depotId={params.id} products={products} users={users} />
        </div>
      </div>
    </Layout>
  )
}
