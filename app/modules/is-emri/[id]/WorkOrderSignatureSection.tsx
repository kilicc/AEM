'use client'

import { useRouter } from 'next/navigation'
import { SignaturePad } from '@/components/forms/SignaturePad'
import { addWorkOrderSignature } from '@/modules/is-emri/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WorkOrderSignatureSectionProps {
  workOrderId: string
  signatures: Array<{ id: string; signer_type: string; signature_data: string }>
  canEdit: boolean
}

export default function WorkOrderSignatureSection({
  workOrderId,
  signatures,
  canEdit,
}: WorkOrderSignatureSectionProps) {
  const router = useRouter()

  async function handleSave(signerType: 'employee' | 'customer', signatureData: string) {
    const result = await addWorkOrderSignature(workOrderId, signerType, signatureData)
    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  const employeeSignature = signatures.find((s) => s.signer_type === 'employee')
  const customerSignature = signatures.find((s) => s.signer_type === 'customer')

  return (
    <Card>
      <CardHeader>
        <CardTitle>İmzalar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {employeeSignature && (
          <div>
            <p className="text-sm font-medium mb-2">Çalışan İmzası</p>
            <img
              src={employeeSignature.signature_data}
              alt="Çalışan İmzası"
              className="border rounded p-2 max-w-xs"
            />
          </div>
        )}

        {customerSignature && (
          <div>
            <p className="text-sm font-medium mb-2">Müşteri İmzası</p>
            <img
              src={customerSignature.signature_data}
              alt="Müşteri İmzası"
              className="border rounded p-2 max-w-xs"
            />
          </div>
        )}

        {canEdit && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!employeeSignature && (
              <SignaturePad
                onSave={(signatureData) => handleSave('employee', signatureData)}
                label="Çalışan İmzası"
              />
            )}
            {!customerSignature && (
              <SignaturePad
                onSave={(signatureData) => handleSave('customer', signatureData)}
                label="Müşteri İmzası"
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

