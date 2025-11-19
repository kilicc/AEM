// Çoklu dil desteği (i18n)

export type Language = 'tr' | 'en'

const translations: Record<Language, Record<string, string>> = {
  tr: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.depot': 'Depo',
    'nav.customers': 'Müşteriler',
    'nav.work_orders': 'İş Emirleri',
    'nav.invoices': 'Faturalar',
    'nav.settings': 'Ayarlar',
    // Common
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.delete': 'Sil',
    'common.edit': 'Düzenle',
    'common.view': 'Görüntüle',
    'common.search': 'Ara',
    'common.loading': 'Yükleniyor...',
    'common.error': 'Hata',
    'common.success': 'Başarılı',
    // Work Orders
    'work_order.status.waiting': 'Beklemede',
    'work_order.status.in_progress': 'İşlemde',
    'work_order.status.completed': 'Tamamlandı',
    'work_order.status.cancelled': 'İptal',
    // Invoices
    'invoice.status.draft': 'Taslak',
    'invoice.status.sent': 'Gönderildi',
    'invoice.status.paid': 'Ödendi',
    'invoice.status.cancelled': 'İptal',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.depot': 'Depot',
    'nav.customers': 'Customers',
    'nav.work_orders': 'Work Orders',
    'nav.invoices': 'Invoices',
    'nav.settings': 'Settings',
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    // Work Orders
    'work_order.status.waiting': 'Waiting',
    'work_order.status.in_progress': 'In Progress',
    'work_order.status.completed': 'Completed',
    'work_order.status.cancelled': 'Cancelled',
    // Invoices
    'invoice.status.draft': 'Draft',
    'invoice.status.sent': 'Sent',
    'invoice.status.paid': 'Paid',
    'invoice.status.cancelled': 'Cancelled',
  },
}

export function getTranslation(key: string, lang: Language = 'tr'): string {
  return translations[lang][key] || key
}

export function setLanguage(lang: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang)
    document.documentElement.lang = lang
  }
}

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'tr'
  return (localStorage.getItem('language') as Language) || 'tr'
}

