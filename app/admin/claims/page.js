'use client'

import { FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function ClaimsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#37322F] mb-2">Claims Management</h1>
        <p className="text-gray-600">Process and manage insurance claims, investigations, and payouts</p>
      </div>

      <Card className="border-gray-200">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Claims Dashboard</h3>
          <p className="text-gray-600 text-center max-w-md mb-4">
            Review filed claims, conduct investigations, approve/reject claims, and process payouts.
          </p>
          <p className="text-sm text-gray-500">(Coming in Phase 2)</p>
        </CardContent>
      </Card>
    </div>
  )
}
