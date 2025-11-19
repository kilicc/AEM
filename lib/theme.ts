// Dark mode ve tema yönetimi

export type Theme = 'light' | 'dark' | 'system'

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  
  try {
    const stored = localStorage.getItem('theme') as Theme
    return stored || 'system'
  } catch {
    return 'system'
  }
}

export function setTheme(theme: Theme) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('theme', theme)
    applyTheme(theme)
  } catch (e) {
    console.error('Tema kaydedilemedi:', e)
  }
}

export function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return

  const root = document.documentElement
  root.classList.remove('light', 'dark')

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    root.classList.add(systemTheme)
  } else {
    root.classList.add(theme)
  }
}

export function initTheme() {
  if (typeof window === 'undefined') return

  const theme = getTheme()
  applyTheme(theme)

  // Sistem teması değişikliklerini dinle
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = (e: MediaQueryListEvent) => {
    if (getTheme() === 'system') {
      applyTheme('system')
    }
  }
  
  // Modern tarayıcılar için
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange)
  } else {
    // Eski tarayıcılar için
    mediaQuery.addListener(handleChange)
  }
}

// Sayfa yüklendiğinde temayı uygula
if (typeof window !== 'undefined') {
  initTheme()
}
