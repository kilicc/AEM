import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getUsers } from '@/modules/admin/actions'
import { DataTable } from '@/components/ui/DataTable'
import { formatDate } from '@/lib/utils'
import UsersPageClient from './UsersPageClient'
import { Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  const usersResult = await getUsers()
  const users = usersResult.data || []

  const columns = [
    {
      key: 'name',
      label: 'Ad Soyad',
      sortable: true,
    },
    {
      key: 'email',
      label: 'E-posta',
      sortable: true,
    },
    {
      key: 'phone',
      label: 'Telefon',
      render: (item: any) => item.phone || '-',
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      render: (item: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            item.role === 'admin'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}
        >
          {item.role === 'admin' ? 'Yönetici' : 'Çalışan'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Kayıt Tarihi',
      sortable: true,
      render: (item: any) => formatDate(item.created_at),
    },
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-3">
                <Users className="w-8 h-8 text-red-600" />
                Kullanıcı Yönetimi
              </h1>
              <p className="text-slate-600 dark:text-slate-400">Sistem kullanıcılarını görüntüleyin ve yönetin</p>
            </div>
            <UsersPageClient />
          </div>

          <div className="animate-fade-in">
            <DataTable
              title="Kullanıcı Listesi"
              data={users}
              columns={columns}
              searchable
              searchKeys={['name', 'email', 'phone']}
              filterable
              filters={[
                {
                  key: 'role',
                  label: 'Rol',
                  options: [
                    { value: 'admin', label: 'Yönetici' },
                    { value: 'user', label: 'Çalışan' },
                  ],
                },
              ]}
              emptyMessage="Henüz kullanıcı bulunmuyor"
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}

