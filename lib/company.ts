// Firma bilgileri - Gelecekte veritabanına taşınabilir

export interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  taxOffice?: string
  taxNumber?: string
  logo?: string
}

export const defaultCompanyInfo: CompanyInfo = {
  name: 'AEM Teknik Servis',
  address: 'Adres bilgisi buraya gelecek',
  phone: '+90 XXX XXX XX XX',
  email: 'info@aem.com',
  taxOffice: 'Vergi Dairesi',
  taxNumber: 'Vergi No',
}

export function getCompanyInfo(): CompanyInfo {
  // Gelecekte veritabanından veya ayarlardan alınabilir
  return defaultCompanyInfo
}

