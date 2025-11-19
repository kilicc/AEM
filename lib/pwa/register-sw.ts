'use client'

// Service Worker kayıt
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker kaydedildi:', registration.scope)
        })
        .catch((error) => {
          console.error('Service Worker kaydı başarısız:', error)
        })
    })
  }
}

// Push notification izni iste
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}

// Push notification gönder
export function showNotification(title: string, options?: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options)
  }
}

