import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getCustomers } from '@/modules/musteri/actions'
import { getServices } from '@/modules/admin/actions'
import { getUsers } from '@/modules/admin/actions'
import { createWorkOrder } from '@/modules/is-emri/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CreateWorkOrderForm from './CreateWorkOrderForm'

export const dynamic = 'force-dynamic'

export default async function NewWorkOrderPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  const customersResult = await getCustomers()
  const customers = customersResult.data || []

  const servicesResult = await getServices()
  const services = servicesResult.data || []

  const usersResult = await getUsers()
  const users = usersResult.data || []

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Yeni İş Emri Oluştur</h1>
              <p className="text-gray-600 dark:text-gray-400">Birden fazla çalışana iş emri atayabilirsiniz</p>
            </div>

            <CreateWorkOrderForm
              customers={customers}
              services={services}
              users={users}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}

