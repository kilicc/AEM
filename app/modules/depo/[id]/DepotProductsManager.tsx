'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { addProduct } from '@/modules/depo/actions'
import { assignTool, returnTool, getUserToolAssignments } from '@/modules/depo/tool-actions'
import { getUsers } from '@/modules/admin/actions'
import { Package, Wrench, Plus, UserCheck, UserX } from 'lucide-react'
import { ExcelImport } from '@/components/depo/ExcelImport'
import { useRouter } from 'next/navigation'
import { ToolAssignmentModal } from './ToolAssignmentModal'

interface DepotProductsManagerProps {
  depotId: string
  products: any[]
  users: any[]
}

export function DepotProductsManager({ depotId, products, users }: DepotProductsManagerProps) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'materials' | 'tools'>('materials')
  const [formData, setFormData] = useState({
    name: '',
    unit: 'adet' as const,
    unit_price: '',
    quantity: '',
    type: 'product' as 'product' | 'tool',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTool, setSelectedTool] = useState<any>(null)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)

  const materials = products.filter((p) => p.type === 'product')
  const tools = products.filter((p) => p.type === 'tool')

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await addProduct(
        depotId,
        formData.name,
        formData.unit,
        parseFloat(formData.unit_price) || 0,
        parseFloat(formData.quantity) || 0,
        formData.type
      )

      if (result.error) {
        setError(result.error)
      } else {
        setFormData({ name: '', unit: 'adet', unit_price: '', quantity: '', type: 'product' })
        setShowAddForm(false)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const materialColumns = [
    {
      key: 'name',
      label: 'Ürün Adı',
      sortable: true,
    },
    {
      key: 'unit',
      label: 'Birim',
      sortable: true,
    },
    {
      key: 'unit_price',
      label: 'Birim Fiyat',
      sortable: true,
      render: (item: any) => `${parseFloat(item.unit_price || 0).toFixed(2)} TL`,
    },
    {
      key: 'quantity',
      label: 'Miktar',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (item: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Miktar güncelleme modal'ı açılabilir
            alert('Miktar güncelleme özelliği yakında eklenecek')
          }}
        >
          Düzenle
        </Button>
      ),
    },
  ]

  const toolColumns = [
    {
      key: 'name',
      label: 'Araç/Gereç Adı',
      sortable: true,
    },
    {
      key: 'unit',
      label: 'Birim',
      sortable: true,
    },
    {
      key: 'quantity',
      label: 'Miktar',
      sortable: true,
    },
    {
      key: 'quantity',
      label: 'Miktar',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Zimmetle',
      render: (item: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedTool(item)
            setShowAssignmentModal(true)
          }}
        >
          <UserCheck className="w-4 h-4 mr-1" />
          Zimmetle
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'materials'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Malzemeler ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'tools'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <Wrench className="w-4 h-4 inline mr-2" />
          Araç/Gereçler ({tools.length})
        </button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-gray-50 dark:bg-gray-800">
            <CardTitle className="text-lg">
              {activeTab === 'materials' ? 'Yeni Malzeme Ekle' : 'Yeni Araç/Gereç Ekle'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Ad <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ürün adı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Birim <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 h-10 dark:bg-gray-700"
                  >
                    <option value="adet">Adet</option>
                    <option value="metre">Metre</option>
                    <option value="kilogram">Kilogram</option>
                    <option value="litre">Litre</option>
                    <option value="metrekare">Metrekare</option>
                    <option value="metrekup">Metreküp</option>
                  </select>
                </div>
                {activeTab === 'materials' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Birim Fiyat <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.unit_price}
                        onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                        required
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Miktar <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        required
                        placeholder="0"
                      />
                    </div>
                  </>
                )}
                {activeTab === 'tools' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">
                      Miktar <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                      placeholder="0"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Ekleniyor...' : 'Ekle'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setError('')
                  }}
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Data Tables */}
      {activeTab === 'materials' ? (
        <DataTable
          title="Malzemeler"
          data={materials}
          columns={materialColumns}
          searchable
          searchKeys={['name', 'unit']}
          filterable
          filters={[
            {
              key: 'unit',
              label: 'Birim',
              options: [
                { value: 'adet', label: 'Adet' },
                { value: 'metre', label: 'Metre' },
                { value: 'kilogram', label: 'Kilogram' },
                { value: 'litre', label: 'Litre' },
                { value: 'metrekare', label: 'Metrekare' },
                { value: 'metrekup', label: 'Metreküp' },
              ],
            },
          ]}
          actions={
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setFormData({ ...formData, type: 'product' })
                  setShowAddForm(true)
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Malzeme
              </Button>
              <ExcelImport depotId={depotId} />
            </div>
          }
          emptyMessage="Henüz malzeme bulunmuyor"
        />
      ) : (
        <DataTable
          title="Araç/Gereçler"
          data={tools}
          columns={toolColumns}
          searchable
          searchKeys={['name', 'unit']}
          actions={
            <Button
              onClick={() => {
                setFormData({ ...formData, type: 'tool' })
                setShowAddForm(true)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Araç/Gereç
            </Button>
          }
          emptyMessage="Henüz araç/gereç bulunmuyor"
        />
      )}

      {/* Tool Assignment Modal */}
      {selectedTool && (
        <ToolAssignmentModal
          tool={selectedTool}
          users={users}
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false)
            setSelectedTool(null)
          }}
          onSuccess={() => {
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

