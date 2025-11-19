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
      <div className="px-4 py-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Yeni İş Emri Oluştur</h1>

        <CreateWorkOrderForm
          customers={customers}
          services={services}
          users={users}
        />
      </div>
    </Layout>
  )
}

