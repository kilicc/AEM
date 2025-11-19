'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getTheme, setTheme, applyTheme, type Theme } from '@/lib/theme'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentTheme(getTheme())
    
    // Sistem teması değişikliklerini dinle
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (getTheme() === 'system') {
        applyTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled className="w-9 h-9 p-0">
          <Monitor className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  function handleThemeChange(theme: Theme) {
    setTheme(theme)
    setCurrentTheme(theme)
    applyTheme(theme)
  }

  return (
    <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-800">
      <Button
        variant={currentTheme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleThemeChange('light')}
        className={`w-8 h-8 p-0 ${currentTheme === 'light' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
        title="Açık Tema"
      >
        <Sun className="w-4 h-4" />
      </Button>
      <Button
        variant={currentTheme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleThemeChange('dark')}
        className={`w-8 h-8 p-0 ${currentTheme === 'dark' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
        title="Koyu Tema"
      >
        <Moon className="w-4 h-4" />
      </Button>
      <Button
        variant={currentTheme === 'system' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleThemeChange('system')}
        className={`w-8 h-8 p-0 ${currentTheme === 'system' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
        title="Sistem Teması"
      >
        <Monitor className="w-4 h-4" />
      </Button>
    </div>
  )
}
