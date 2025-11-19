'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FormField {
  type: string
  name: string
  label: string
  autoFill?: string
  required?: boolean
  rows?: number
  unit?: string
  options?: string[]
}

interface FormSection {
  title: string
  fields: FormField[]
}

interface FormTemplate {
  title: string
  sections: FormSection[]
}

interface ServiceFormRendererProps {
  template: FormTemplate | string | null
  customerData?: any
  initialData?: Record<string, any>
  onSave?: (data: Record<string, any>) => void
  readOnly?: boolean
}

export function ServiceFormRenderer({
  template,
  customerData,
  initialData = {},
  onSave,
  readOnly = false,
}: ServiceFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [parsedTemplate, setParsedTemplate] = useState<FormTemplate | null>(null)

  useEffect(() => {
    if (typeof template === 'string') {
      try {
        setParsedTemplate(JSON.parse(template))
      } catch {
        setParsedTemplate(null)
      }
    } else {
      setParsedTemplate(template)
    }
  }, [template])

  useEffect(() => {
    if (parsedTemplate && customerData) {
      const autoFilled: Record<string, any> = {}
      parsedTemplate.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (field.autoFill) {
            const path = field.autoFill.split('.')
            if (path[0] === 'customer') {
              const value = customerData[path[1]]
              if (value) {
                autoFilled[field.name] = value
              }
            }
          }
        })
      })
      setFormData((prev) => ({ ...prev, ...autoFilled }))
    }
  }, [parsedTemplate, customerData])

  if (!parsedTemplate) {
    return (
      <div className="text-center py-8 text-gray-500">
        Form şablonu bulunamadı
      </div>
    )
  }

  function handleChange(name: string, value: any) {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (onSave) {
      onSave(formData)
    }
  }

  function renderField(field: FormField) {
    const value = formData[field.name] || ''

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            disabled={readOnly}
            placeholder={field.label}
          />
        )

      case 'number':
        return (
          <div className="flex">
            <Input
              type="number"
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
              disabled={readOnly}
              placeholder={field.label}
              className="flex-1"
            />
            {field.unit && (
              <span className="ml-2 flex items-center text-gray-500">
                {field.unit}
              </span>
            )}
          </div>
        )

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            disabled={readOnly}
            rows={field.rows || 4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={field.label}
          />
        )

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              disabled={readOnly}
              className="mr-2"
            />
            <span>{field.label}</span>
          </label>
        )

      case 'info':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
            {field.label}
          </div>
        )

      case 'signature':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded p-4 min-h-[100px] flex items-center justify-center">
            {readOnly && value ? (
              <img src={value} alt={field.label} className="max-w-full max-h-32" />
            ) : (
              <span className="text-gray-400">{field.label}</span>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">{parsedTemplate.title}</h2>

      {parsedTemplate.sections.map((section, sectionIndex) => (
        <Card key={sectionIndex}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex}>
                  {field.type !== 'checkbox' && field.type !== 'info' && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  )}
                  {renderField(field)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {!readOnly && onSave && (
        <div className="flex justify-end">
          <Button type="submit">Kaydet</Button>
        </div>
      )}
    </form>
  )
}

