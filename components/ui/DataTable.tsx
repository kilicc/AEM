'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, Download, Upload, X } from 'lucide-react'

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  title: string
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  searchKeys?: string[]
  filterable?: boolean
  filters?: Array<{
    key: string
    label: string
    options: Array<{ value: string; label: string }>
  }>
  selectable?: boolean
  onSelect?: (selected: T[]) => void
  actions?: React.ReactNode
  emptyMessage?: string
  onExport?: () => void
  onImport?: () => void
}

export function DataTable<T extends { id: string }>({
  title,
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Ara...',
  searchKeys = [],
  filterable = false,
  filters = [],
  selectable = false,
  onSelect,
  actions,
  emptyMessage = 'Veri bulunamadı',
  onExport,
  onImport,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  // Filter and search
  const filteredData = useMemo(() => {
    let result = [...data]

    // Search
    if (search && searchKeys.length > 0) {
      const searchLower = search.toLowerCase()
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const value = (item as any)[key]
          return value && String(value).toLowerCase().includes(searchLower)
        })
      )
    }

    // Filters
    if (filterable && filters.length > 0) {
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) {
          result = result.filter((item) => (item as any)[key] === value)
        }
      })
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = (a as any)[sortConfig.key]
        const bVal = (b as any)[sortConfig.key]
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, search, searchKeys, activeFilters, sortConfig, filterable, filters])

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(filteredData.map((item) => item.id))
    } else {
      setSelected([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const newSelected = checked ? [...prev, id] : prev.filter((item) => item !== id)
      if (onSelect) {
        onSelect(data.filter((item) => newSelected.includes(item.id)))
      }
      return newSelected
    })
  }

  const clearFilters = () => {
    setActiveFilters({})
    setSearch('')
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Dışa Aktar
              </Button>
            )}
            {onImport && (
              <Button variant="outline" size="sm" onClick={onImport}>
                <Upload className="w-4 h-4 mr-2" />
                İçe Aktar
              </Button>
            )}
            {actions}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 space-y-3">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          )}

          {filterable && filters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <select
                  key={filter.key}
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({ ...prev, [filter.key]: e.target.value }))
                  }
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
              {(Object.values(activeFilters).some((v) => v) || search) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Temizle
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {selectable && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selected.length === filteredData.length && filteredData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortConfig?.key === column.key && (
                        <span className="text-red-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {column.render
                          ? column.render(item)
                          : String((item as any)[column.key] || '')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredData.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
            Toplam {filteredData.length} kayıt gösteriliyor
            {selected.length > 0 && selectable && ` (${selected.length} seçili)`}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

