'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PhotoUpload } from '@/components/forms/PhotoUpload'
import { uploadWorkOrderPhoto } from '@/modules/is-emri/actions'

interface WorkOrderPhotoUploadProps {
  workOrderId: string
  photos: Array<{ id: string; photo_url: string; photo_type: 'before' | 'after' }>
  readOnly?: boolean
}

export default function WorkOrderPhotoUpload({
  workOrderId,
  photos,
  readOnly,
}: WorkOrderPhotoUploadProps) {
  const router = useRouter()

  async function handleUpload(file: File, type: 'before' | 'after'): Promise<string> {
    // TODO: Supabase Storage'a yükle
    // Şimdilik base64 olarak kaydediyoruz
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async () => {
        const photoUrl = reader.result as string
        const result = await uploadWorkOrderPhoto(workOrderId, photoUrl, type)
        if (result.error) {
          reject(new Error(result.error))
        } else {
          router.refresh()
          resolve(photoUrl)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return <PhotoUpload photos={photos} onUpload={handleUpload} readOnly={readOnly} />
}

