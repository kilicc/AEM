'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getTheme, setTheme, type Theme } from '@/lib/theme'

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentTheme(getTheme())
  }, [])

  if (!mounted) {
    return null
  }

  function handleThemeChange(theme: Theme) {
    setTheme(theme)
    setCurrentTheme(theme)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={currentTheme === 'light' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleThemeChange('light')}
      >
        ☀️
      </Button>
      <Button
        variant={currentTheme === 'dark' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleThemeChange('dark')}
      >
        🌙
      </Button>
      <Button
        variant={currentTheme === 'system' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleThemeChange('system')}
      >
        💻
      </Button>
    </div>
  )
}

