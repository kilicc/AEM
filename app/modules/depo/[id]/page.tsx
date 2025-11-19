import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect, notFound } from 'next/navigation'
import { getDepots } from '@/modules/depo/actions'
import { getProducts } from '@/modules/depo/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ExcelImport } from '@/components/depo/ExcelImport'

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

  return (
    <Layout>
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/modules/depo" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Depolara Dön
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{depot.name}</h1>
            <p className="text-gray-600 mt-1">{depot.address || 'Adres belirtilmemiş'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ürünler</CardTitle>
              </CardHeader>
              <CardContent>
                {products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Ürün Adı</th>
                          <th className="text-left p-2">Birim</th>
                          <th className="text-left p-2">Birim Fiyat</th>
                          <th className="text-left p-2">Miktar</th>
                          <th className="text-left p-2">Tip</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product: any) => (
                          <tr key={product.id} className="border-b">
                            <td className="p-2">{product.name}</td>
                            <td className="p-2">{product.unit}</td>
                            <td className="p-2">{product.unit_price} TL</td>
                            <td className="p-2">{product.quantity}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                product.type === 'tool' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {product.type === 'tool' ? 'Araç/Gereç' : 'Malzeme'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Henüz ürün bulunmuyor</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <ExcelImport depotId={params.id} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

