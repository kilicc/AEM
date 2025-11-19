'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDepot } from '@/modules/depo/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function CreateDepotForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!name.trim()) {
      setError('Depo adı zorunludur')
      setLoading(false)
      return
    }

    const result = await createDepot(name.trim(), address.trim() || undefined)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/modules/depo/${result.data.id}`)
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Depo Adı <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Örn: Merkez Depo, Şube Depo"
              className="h-12 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Adres
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
              placeholder="Depo adresi..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 text-base font-semibold"
            >
              {loading ? 'Oluşturuluyor...' : 'Depo Oluştur'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-12 px-6"
            >
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

