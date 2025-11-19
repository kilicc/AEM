'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PhotoUploadProps {
  onUpload: (file: File, type: 'before' | 'after') => Promise<string>
  photos?: Array<{ id: string; photo_url: string; photo_type: 'before' | 'after' }>
  readOnly?: boolean
}

export function PhotoUpload({ onUpload, photos = [], readOnly = false }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await onUpload(file, type)
    } catch (error) {
      console.error('Fotoğraf yükleme hatası:', error)
    } finally {
      setUploading(false)
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const beforePhotos = photos.filter((p) => p.photo_type === 'before')
  const afterPhotos = photos.filter((p) => p.photo_type === 'after')

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Öncesi Fotoğraflar</h3>
          {!readOnly && (
            <div className="mb-4">
              <input
                ref={beforeInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'before')}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => beforeInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Yükleniyor...' : 'Fotoğraf Ekle'}
              </Button>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {beforePhotos.map((photo) => (
              <div key={photo.id} className="relative">
                <img
                  src={photo.photo_url}
                  alt="Öncesi"
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Sonrası Fotoğraflar</h3>
          {!readOnly && (
            <div className="mb-4">
              <input
                ref={afterInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'after')}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => afterInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Yükleniyor...' : 'Fotoğraf Ekle'}
              </Button>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {afterPhotos.map((photo) => (
              <div key={photo.id} className="relative">
                <img
                  src={photo.photo_url}
                  alt="Sonrası"
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

