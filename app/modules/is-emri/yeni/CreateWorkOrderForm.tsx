'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createWorkOrder } from '@/modules/is-emri/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CreateWorkOrderFormProps {
  customers: any[]
  services: any[]
  users: any[]
}

export default function CreateWorkOrderForm({
  customers,
  services,
  users,
}: CreateWorkOrderFormProps) {
  const router = useRouter()
  const [customerId, setCustomerId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([])
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleUser = (userId: string) => {
    setAssignedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!customerId || !serviceId || assignedUserIds.length === 0) {
      setError('Lütfen tüm alanları doldurun ve en az bir çalışan seçin')
      setLoading(false)
      return
    }

    // Her seçili çalışan için ayrı iş emri oluştur
    const results = await Promise.all(
      assignedUserIds.map(userId => 
        createWorkOrder({
          customer_id: customerId,
          service_id: serviceId,
          assigned_user_id: userId,
          priority,
          notes: notes || undefined,
        })
      )
    )

    const firstError = results.find(r => r.error)
    if (firstError) {
      setError(firstError.error || 'İş emri oluşturulurken bir hata oluştu')
      setLoading(false)
    } else {
      // İlk oluşturulan iş emrine yönlendir
      router.push(`/modules/is-emri/${results[0].data.id}`)
    }
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">İş Emri Bilgileri</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Müşteri <span className="text-red-500">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white h-12"
            >
              <option value="">Müşteri Seçin</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Hizmet <span className="text-red-500">*</span>
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white h-12"
            >
              <option value="">Hizmet Seçin</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Atanan Çalışanlar <span className="text-red-500">*</span>
              {assignedUserIds.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  ({assignedUserIds.length} çalışan seçildi)
                </span>
              )}
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-48 overflow-y-auto bg-white dark:bg-gray-700">
              {users.filter((u) => u.role === 'user').length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Henüz çalışan bulunmuyor</p>
              ) : (
                <div className="space-y-2">
                  {users
                    .filter((u) => u.role === 'user')
                    .map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={assignedUserIds.includes(user.id)}
                          onChange={() => toggleUser(user.id)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </label>
                    ))}
                </div>
              )}
            </div>
            {assignedUserIds.length === 0 && (
              <p className="text-xs text-red-500 mt-1">En az bir çalışan seçmelisiniz</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Öncelik
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white h-12"
            >
              <option value="low">Düşük</option>
              <option value="normal">Normal</option>
              <option value="high">Yüksek</option>
              <option value="urgent">Acil</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Notlar
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              placeholder="İş emri ile ilgili notlar..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading || assignedUserIds.length === 0} 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 text-base font-semibold disabled:opacity-50"
            >
              {loading ? 'Oluşturuluyor...' : `İş Emri Oluştur${assignedUserIds.length > 1 ? ` (${assignedUserIds.length} adet)` : ''}`}
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
