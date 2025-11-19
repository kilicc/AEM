'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CreateUserModal from './CreateUserModal'
import { useRouter } from 'next/navigation'

export default function UsersPageClient() {
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()

  function handleSuccess() {
    router.refresh()
  }

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Yeni Kullanıcı Ekle
      </Button>
      <CreateUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}

