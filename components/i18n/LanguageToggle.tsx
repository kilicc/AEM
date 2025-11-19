'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getLanguage, setLanguage, type Language } from '@/lib/i18n'

export function LanguageToggle() {
  const [currentLang, setCurrentLang] = useState<Language>('tr')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const lang = getLanguage()
    setCurrentLang(lang)
    setLanguage(lang)
  }, [])

  if (!mounted) {
    return null
  }

  function handleLanguageChange(lang: Language) {
    setLanguage(lang)
    setCurrentLang(lang)
    window.location.reload() // Sayfayı yenile (i18n için)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={currentLang === 'tr' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLanguageChange('tr')}
      >
        TR
      </Button>
      <Button
        variant={currentLang === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLanguageChange('en')}
      >
        EN
      </Button>
    </div>
  )
}

