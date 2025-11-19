'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { importProductsFromExcel } from '@/modules/depo/excel-import'
import * as XLSX from 'xlsx'

interface ExcelImportProps {
  depotId: string
  onSuccess?: () => void
}

// Client component için dynamic import
if (typeof window !== 'undefined') {
  // Browser'da çalışıyor
}

export function ExcelImport({ depotId, onSuccess }: ExcelImportProps) {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      // Excel dosyasını oku
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet)

      // Veriyi formatla
      const products = jsonData.map((row: any) => {
        // Excel'deki sütun isimlerini eşleştir
        return {
          name: row['Ürün Adı'] || row['name'] || row['ÜrünAdı'] || '',
          unit: (row['Birim'] || row['unit'] || 'adet').toLowerCase(),
          unit_price: parseFloat(row['Birim Fiyat'] || row['unit_price'] || row['BirimFiyat'] || 0),
          quantity: parseFloat(row['Miktar'] || row['quantity'] || 0),
          type: (row['Tip'] || row['type'] || 'product').toLowerCase(),
          category_id: row['Kategori ID'] || row['category_id'] || row['KategoriID'] || undefined,
          barcode: row['Barkod'] || row['barcode'] || undefined,
        }
      }).filter((p: any) => p.name) // Boş satırları filtrele

      // Validasyon
      const validProducts = products.filter((p: any) => {
        const validUnits = ['adet', 'metre', 'kilogram', 'litre', 'metrekare', 'metrekup']
        const validTypes = ['product', 'tool']
        
        return (
          p.name &&
          validUnits.includes(p.unit) &&
          validTypes.includes(p.type) &&
          !isNaN(p.unit_price) &&
          !isNaN(p.quantity)
        )
      })

      if (validProducts.length === 0) {
        setResult({
          success: 0,
          failed: 0,
          errors: ['Geçerli ürün bulunamadı. Lütfen Excel formatını kontrol edin.'],
        })
        setUploading(false)
        return
      }

      // Import işlemini başlat
      const response = await importProductsFromExcel(depotId, validProducts)

      if (response.error) {
        setResult({
          success: 0,
          failed: validProducts.length,
          errors: [response.error],
        })
      } else if (response.data) {
        setResult(response.data)
        if (response.data.success > 0) {
          // Sayfayı yenile
          setTimeout(() => {
            window.location.reload()
          }, 2000)
          if (onSuccess) {
            onSuccess()
          }
        }
      }
    } catch (error: any) {
      setResult({
        success: 0,
        failed: 0,
        errors: [`Hata: ${error.message}`],
      })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    // Örnek veri
    const sampleData = [
      {
        'Ürün Adı': 'Örnek Ürün 1',
        'Birim': 'adet',
        'Birim Fiyat': 100.50,
        'Miktar': 50,
        'Tip': 'product',
        'Kategori ID': '',
        'Barkod': 'BC001',
      },
      {
        'Ürün Adı': 'Örnek Ürün 2',
        'Birim': 'metre',
        'Birim Fiyat': 25.00,
        'Miktar': 100,
        'Tip': 'product',
        'Kategori ID': '',
        'Barkod': 'BC002',
      },
    ]

    const worksheet = XLSX.utils.json_to_sheet(sampleData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ürünler')

    // Excel dosyasını indir
    XLSX.writeFile(workbook, 'urun_import_ornegi.xlsx')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Excel&apos;den Toplu Ürün Ekleme</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={downloadTemplate}
            disabled={uploading}
          >
            Örnek Excel İndir
          </Button>
          <div className="flex-1">
            <label htmlFor="excel-upload" className="sr-only">
              Excel dosyası yükle
            </label>
            <input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {uploading && (
          <div className="text-blue-600">Excel dosyası işleniyor...</div>
        )}

        {result && (
          <div className={`p-4 rounded-lg ${
            result.failed === 0
              ? 'bg-green-50 text-green-800'
              : result.success > 0
              ? 'bg-yellow-50 text-yellow-800'
              : 'bg-red-50 text-red-800'
          }`}>
            <div className="font-semibold mb-2">
              İşlem Sonucu:
            </div>
            <div className="space-y-1">
              <div>Başarılı: {result.success}</div>
              <div>Başarısız: {result.failed}</div>
              {result.errors.length > 0 && (
                <div className="mt-2">
                  <div className="font-semibold">Hatalar:</div>
                  <ul className="list-disc list-inside text-sm">
                    {result.errors.slice(0, 10).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                    {result.errors.length > 10 && (
                      <li>... ve {result.errors.length - 10} hata daha</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p className="font-semibold mb-2">Excel Formatı:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Ürün Adı:</strong> Zorunlu - Ürünün adı</li>
            <li><strong>Birim:</strong> Zorunlu - adet, metre, kilogram, litre, metrekare, metrekup</li>
            <li><strong>Birim Fiyat:</strong> Zorunlu - Sayısal değer</li>
            <li><strong>Miktar:</strong> Zorunlu - Sayısal değer</li>
            <li><strong>Tip:</strong> Zorunlu - product veya tool</li>
            <li><strong>Kategori ID:</strong> Opsiyonel - Kategori ID&apos;si</li>
            <li><strong>Barkod:</strong> Opsiyonel - Ürün barkodu</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

