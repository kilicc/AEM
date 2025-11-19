'use client'

import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[]
}

export function KeyboardShortcuts({ shortcuts }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.alt ? event.altKey : !event.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault()
          shortcut.action()
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts])

  return null
}

// Yaygın kısayollar
export const commonShortcuts: KeyboardShortcut[] = [
  {
    key: 'k',
    ctrl: true,
    action: () => {
      // Global arama aç
      const searchInput = document.querySelector<HTMLInputElement>('[data-global-search]')
      if (searchInput) {
        searchInput.focus()
      }
    },
    description: 'Global arama',
  },
  {
    key: 'n',
    ctrl: true,
    action: () => {
      // Yeni iş emri
      window.location.href = '/modules/is-emri/yeni'
    },
    description: 'Yeni iş emri',
  },
  {
    key: 's',
    ctrl: true,
    action: () => {
      // Kaydet (form varsa)
      const saveButton = document.querySelector<HTMLButtonElement>('[data-save-button]')
      if (saveButton) {
        saveButton.click()
      }
    },
    description: 'Kaydet',
  },
]

