import { getCompanyInfo } from '@/lib/company'

export function CompanyStamp() {
  const company = getCompanyInfo()

  return (
    <div className="mt-8 pt-6 border-t-2 border-gray-300">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-2">{company.name}</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>{company.address}</p>
          <p>Tel: {company.phone} | E-posta: {company.email}</p>
          {company.taxOffice && company.taxNumber && (
            <p>
              {company.taxOffice} | Vergi No: {company.taxNumber}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

