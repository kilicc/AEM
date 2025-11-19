import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getDepots } from '@/modules/depo/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DepotsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  const result = await getDepots()
  const depots = result.data || []

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Depolar</h1>
          <Link href="/modules/depo/yeni">
            <Button>Yeni Depo</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {depots.map((depot: any) => (
            <Card key={depot.id}>
              <CardHeader>
                <CardTitle>{depot.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{depot.address || 'Adres belirtilmemiş'}</p>
                <Link href={`/modules/depo/${depot.id}`}>
                  <Button variant="outline" className="w-full">
                    Detay
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}

          {depots.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="pt-6 text-center text-gray-500">
                <p>Henüz depo bulunmuyor</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}

