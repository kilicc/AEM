'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { assignTool, returnTool } from '@/modules/depo/tool-actions'
import { X } from 'lucide-react'

interface ToolAssignmentModalProps {
  tool: any
  users: any[]
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ToolAssignmentModal({
  tool,
  users,
  isOpen,
  onClose,
  onSuccess,
}: ToolAssignmentModalProps) {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [assignments, setAssignments] = useState<any[]>([])

  useEffect(() => {
    if (isOpen && tool) {
      loadAssignments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tool])

  async function loadAssignments() {
    try {
      const response = await fetch(`/api/tool-assignments?tool_id=${tool.id}`)
      if (response.ok) {
        const result = await response.json()
        setAssignments(result.data || [])
      }
    } catch (err) {
      console.error('Zimmetler yüklenemedi:', err)
    }
  }

  async function handleAssign() {
    if (!selectedUserId) {
      setError('Lütfen bir kullanıcı seçin')
      return
    }

    setError('')
    setLoading(true)

    try {
      const result = await assignTool(tool.id, selectedUserId)
      if (result.error) {
        setError(result.error)
      } else {
        setSelectedUserId('')
        await loadAssignments()
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  async function handleReturn(assignmentId: string) {
    setLoading(true)
    try {
      const result = await returnTool(assignmentId)
      if (result.error) {
        setError(result.error)
      } else {
        await loadAssignments()
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl border border-gray-200 dark:border-gray-700 shadow-xl">
        <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
            {tool.name} - Zimmetleme
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Yeni Zimmet */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                Yeni Zimmet
              </h3>
              <div className="flex gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 h-10 dark:bg-gray-700"
                >
                  <option value="">Kullanıcı Seçin</option>
                  {users
                    .filter((u) => u.role === 'user')
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                </select>
                <Button
                  onClick={handleAssign}
                  disabled={loading || !selectedUserId}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Zimmetle
                </Button>
              </div>
            </div>

            {/* Mevcut Zimmetler */}
            {assignments.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                  Mevcut Zimmetler
                </h3>
                <div className="space-y-2">
                  {assignments.map((assignment: any) => (
                    <div
                      key={assignment.id}
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {assignment.users?.name || 'Bilinmiyor'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(assignment.assigned_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReturn(assignment.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700"
                      >
                        Geri Al
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

