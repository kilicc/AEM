'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Arka kamera
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err: any) {
      setError('Kamera erişimi reddedildi: ' + err.message)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)

        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        onCapture(imageData)
        stopCamera()
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Fotoğraf Çek</h3>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        <div className="relative mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full rounded ${stream ? 'block' : 'hidden'}`}
          />
          <canvas ref={canvasRef} className="hidden" />
          {!stream && (
            <div className="bg-gray-200 h-64 rounded flex items-center justify-center">
              <p className="text-gray-500">Kamera başlatılmadı</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!stream ? (
            <Button onClick={startCamera} className="flex-1">
              Kamerayı Aç
            </Button>
          ) : (
            <>
              <Button onClick={capturePhoto} className="flex-1" variant="default">
                Fotoğraf Çek
              </Button>
              <Button onClick={stopCamera} variant="outline">
                Durdur
              </Button>
            </>
          )}
          <Button onClick={handleClose} variant="outline">
            Kapat
          </Button>
        </div>
      </div>
    </div>
  )
}

