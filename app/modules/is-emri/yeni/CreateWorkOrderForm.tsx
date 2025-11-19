'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createWorkOrder } from '@/modules/is-emri/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Calendar, Clock, MapPin, FileText, Users, AlertCircle } from 'lucide-react'

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
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [customerDevices, setCustomerDevices] = useState<any[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Müşteri seçildiğinde cihazlarını yükle
  useEffect(() => {
    if (customerId) {
      loadCustomerDevices(customerId)
    } else {
      setCustomerDevices([])
      setSelectedDeviceId('')
    }
  }, [customerId])

  async function loadCustomerDevices(customerId: string) {
    try {
      const response = await fetch(`/api/customer-devices?customer_id=${customerId}`)
      if (response.ok) {
        const data = await response.json()
        setCustomerDevices(data.devices || [])
      }
    } catch (err) {
      console.error('Cihazlar yüklenemedi:', err)
    }
  }

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
      setError('Lütfen tüm zorunlu alanları doldurun ve en az bir çalışan seçin')
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

  const selectedCustomer = customers.find(c => c.id === customerId)
  const selectedService = services.find(s => s.id === serviceId)

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            İş Emri Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Müşteri Seçimi */}
              <div className="md:col-span-2">
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
                      {customer.name} - {customer.phone} {customer.city ? `(${customer.city})` : ''}
                    </option>
                  ))}
                </select>
                {selectedCustomer && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedCustomer.name}</p>
                    <p className="text-gray-600 dark:text-gray-400">{selectedCustomer.address}</p>
                    {selectedCustomer.email && (
                      <p className="text-gray-600 dark:text-gray-400">{selectedCustomer.email}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Müşteri Cihazı Seçimi */}
              {customerDevices.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Müşteri Cihazı (Opsiyonel)
                  </label>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white h-12"
                  >
                    <option value="">Cihaz Seçin (Opsiyonel)</option>
                    {customerDevices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.device_type} - {device.brand} {device.model} {device.serial_number ? `(${device.serial_number})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Hizmet Seçimi */}
              <div className="md:col-span-2">
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
                {selectedService && selectedService.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {selectedService.description}
                  </p>
                )}
              </div>

              {/* Atanan Çalışanlar */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Atanan Çalışanlar <span className="text-red-500">*</span>
                  {assignedUserIds.length > 0 && (
                    <span className="ml-2 text-xs text-gray-500 font-normal">
                      ({assignedUserIds.length} çalışan seçildi)
                    </span>
                  )}
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-64 overflow-y-auto bg-white dark:bg-gray-700">
                  {users.filter((u) => u.role === 'user').length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Henüz çalışan bulunmuyor
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {users
                        .filter((u) => u.role === 'user')
                        .map((user) => (
                          <label
                            key={user.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={assignedUserIds.includes(user.id)}
                              onChange={() => toggleUser(user.id)}
                              className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user.email} {user.phone ? `• ${user.phone}` : ''}
                              </p>
                            </div>
                          </label>
                        ))}
                    </div>
                  )}
                </div>
                {assignedUserIds.length === 0 && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    En az bir çalışan seçmelisiniz
                  </p>
                )}
              </div>

              {/* Öncelik */}
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

              {/* Planlanan Tarih */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Planlanan Tarih (Opsiyonel)
                </label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Planlanan Saat */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Planlanan Saat (Opsiyonel)
                </label>
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Notlar */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Notlar ve Açıklamalar
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="İş emri ile ilgili detaylı notlar, özel talimatlar, önemli bilgiler..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="submit" 
                disabled={loading || assignedUserIds.length === 0} 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 text-base font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
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
    </div>
  )
}
