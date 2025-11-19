'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestSupabasePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/test-supabase')
      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.details || data.error || 'Bilinmeyen hata')
      }
    } catch (err: any) {
      setError(err.message || 'Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  const testClientSide = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Client-side test
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        setError('Environment variables bulunamadı!')
        setLoading(false)
        return
      }

      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data, error: queryError } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (queryError) {
        setError(`Query hatası: ${queryError.message}`)
      } else {
        setResult({
          success: true,
          message: 'Client-side bağlantı başarılı!',
          data,
          env: {
            url: supabaseUrl ? '✅ Tanımlı' : '❌ Eksik',
            key: supabaseKey ? '✅ Tanımlı' : '❌ Eksik',
          },
        })
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmeyen hata')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Supabase Bağlantı Testi</h1>

      <div className="space-y-4 mb-6">
        <Button onClick={testConnection} disabled={loading}>
          {loading ? 'Test ediliyor...' : 'Server-Side Bağlantıyı Test Et'}
        </Button>
        <Button onClick={testClientSide} disabled={loading} variant="outline">
          {loading ? 'Test ediliyor...' : 'Client-Side Bağlantıyı Test Et'}
        </Button>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Hata</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-red-50 p-4 rounded text-sm overflow-auto">
              {error}
            </pre>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="text-green-600">Başarılı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Mesaj:</strong> {result.message}
              </div>
              {result.env && (
                <div>
                  <strong>Environment Variables:</strong>
                  <ul className="list-disc list-inside mt-2">
                    <li>NEXT_PUBLIC_SUPABASE_URL: {result.env.url}</li>
                    <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {result.env.key}</li>
                  </ul>
                </div>
              )}
              {result.tests && (
                <div>
                  <strong>Test Sonuçları:</strong>
                  <ul className="list-disc list-inside mt-2">
                    <li>Bağlantı: {result.tests.connection ? '✅' : '❌'}</li>
                    <li>Auth: {result.tests.auth ? '✅' : '❌'}</li>
                    <li>
                      Tablolar:
                      <ul className="list-disc list-inside ml-4">
                        {Object.entries(result.tests.tables || {}).map(
                          ([table, exists]) => (
                            <li key={table}>
                              {table}: {exists ? '✅' : '❌'}
                            </li>
                          )
                        )}
                      </ul>
                    </li>
                  </ul>
                </div>
              )}
              {result.user && (
                <div>
                  <strong>Kullanıcı:</strong> {result.user.email} ({result.user.id})
                </div>
              )}
              <details className="mt-4">
                <summary className="cursor-pointer font-semibold">
                  Detaylı Sonuç
                </summary>
                <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto mt-2">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Environment Variables Kontrolü</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                <span className="text-green-600">
                  ✅ Tanımlı ({process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...)
                </span>
              ) : (
                <span className="text-red-600">❌ Eksik</span>
              )}
            </div>
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                <span className="text-green-600">
                  ✅ Tanımlı ({process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...)
                </span>
              ) : (
                <span className="text-red-600">❌ Eksik</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

