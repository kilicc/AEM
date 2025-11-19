'use client'

import { useState } from 'react'
import { createUser } from '@/modules/admin/user-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateUserModal({ open, onClose, onSuccess }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'user' as 'admin' | 'user',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.email || !formData.password || !formData.name) {
      setError('E-posta, şifre ve ad soyad zorunludur')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      setLoading(false)
      return
    }

    const result = await createUser(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setFormData({
        email: '',
        password: '',
        name: '',
        phone: '',
        role: 'user',
      })
      setError('')
      onSuccess()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Yeni Kullanıcı Ekle
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Sisteme yeni bir kullanıcı veya çalışan ekleyin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Ad Soyad <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Ahmet Yılmaz"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              E-posta <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="ornek@email.com"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Şifre <span className="text-red-500">*</span>
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              placeholder="En az 6 karakter"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Telefon (Opsiyonel)
            </label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="5xx xxx xx xx"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="user">Çalışan (User)</option>
              <option value="admin">Yönetici (Admin)</option>
            </select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

