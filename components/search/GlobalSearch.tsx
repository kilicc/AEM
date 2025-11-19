'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SearchResult {
  type: 'work_order' | 'customer' | 'invoice' | 'product'
  id: string
  title: string
  subtitle?: string
  url: string
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.results || [])
      } catch (error) {
        console.error('Arama hatası:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  return (
    <div className="relative">
      <Input
        type="search"
        placeholder="Ara... (iş emri, müşteri, fatura)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />
      {query.length >= 2 && (
        <Card className="absolute z-50 w-full mt-1 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Aranıyor...</div>
            ) : results.length > 0 ? (
              <div className="divide-y">
                {results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.url}
                    className="block p-3 hover:bg-gray-50"
                    onClick={() => setQuery('')}
                  >
                    <div className="font-medium">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-sm text-gray-500">{result.subtitle}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {result.type === 'work_order' && 'İş Emri'}
                      {result.type === 'customer' && 'Müşteri'}
                      {result.type === 'invoice' && 'Fatura'}
                      {result.type === 'product' && 'Ürün'}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">Sonuç bulunamadı</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

