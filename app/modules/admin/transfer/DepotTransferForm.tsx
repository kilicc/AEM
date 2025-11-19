'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { transferProduct } from '@/modules/depo/transfer-actions'
import { getProducts } from '@/modules/depo/actions'
import { useRouter } from 'next/navigation'

interface DepotTransferFormProps {
  depots: any[]
}

export default function DepotTransferForm({ depots }: DepotTransferFormProps) {
  const router = useRouter()
  const [fromDepotId, setFromDepotId] = useState('')
  const [toDepotId, setToDepotId] = useState('')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (fromDepotId) {
      loadProducts(fromDepotId)
    } else {
      setProducts([])
      setProductId('')
    }
  }, [fromDepotId])

  async function loadProducts(depotId: string) {
    try {
      const response = await fetch(`/api/depot-products?depot_id=${depotId}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error('Ürünler yüklenemedi:', err)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!fromDepotId || !toDepotId || !productId || !quantity) {
      setError('Lütfen tüm alanları doldurun')
      setLoading(false)
      return
    }

    try {
      const result = await transferProduct({
        product_id: productId,
        from_depot_id: fromDepotId,
        to_depot_id: toDepotId,
        quantity: parseFloat(quantity),
        notes: notes || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Transfer başarılı!')
        setFromDepotId('')
        setToDepotId('')
        setProductId('')
        setQuantity('')
        setNotes('')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const selectedProduct = products.find((p) => p.id === productId)

  return (
    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Ürün Transferi</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Kaynak Depo <span className="text-red-500">*</span>
              </label>
              <select
                value={fromDepotId}
                onChange={(e) => setFromDepotId(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 h-12 dark:bg-gray-700"
              >
                <option value="">Depo Seçin</option>
                {depots.map((depot) => (
                  <option key={depot.id} value={depot.id}>
                    {depot.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Hedef Depo <span className="text-red-500">*</span>
              </label>
              <select
                value={toDepotId}
                onChange={(e) => setToDepotId(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 h-12 dark:bg-gray-700"
              >
                <option value="">Depo Seçin</option>
                {depots
                  .filter((d) => d.id !== fromDepotId)
                  .map((depot) => (
                    <option key={depot.id} value={depot.id}>
                      {depot.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">
                Ürün <span className="text-red-500">*</span>
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                disabled={!fromDepotId}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 h-12 dark:bg-gray-700"
              >
                <option value="">Ürün Seçin</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.quantity} {product.unit}
                  </option>
                ))}
              </select>
              {selectedProduct && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Mevcut stok: {selectedProduct.quantity} {selectedProduct.unit}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Transfer Miktarı <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                placeholder="0"
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Notlar</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Transfer notu..."
                className="h-12"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 h-12"
            >
              {loading ? 'Transfer ediliyor...' : 'Transfer Et'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

