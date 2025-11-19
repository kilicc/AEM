'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BulkActionsProps {
  selectedItems: string[]
  onAction: (action: string, items: string[]) => Promise<void>
  actions: Array<{
    label: string
    value: string
    variant?: 'default' | 'destructive' | 'outline'
  }>
}

export function BulkActions({ selectedItems, onAction, actions }: BulkActionsProps) {
  const [loading, setLoading] = useState(false)

  if (selectedItems.length === 0) {
    return null
  }

  async function handleAction(action: string) {
    setLoading(true)
    try {
      await onAction(action, selectedItems)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="sticky top-0 z-10 bg-white shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">
              {selectedItems.length} öğe seçildi
            </span>
          </div>
          <div className="flex gap-2">
            {actions.map((action) => (
              <Button
                key={action.value}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={() => handleAction(action.value)}
                disabled={loading}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

