'use client'

import { ClipboardCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function UnderwritingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#37322F] mb-2">Underwriting Workflow</h1>
        <p className="text-gray-600">Manage application reviews, risk assessment, and approval process</p>
      </div>

      <Card className="border-gray-200">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ClipboardCheck className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Underwriting Queue</h3>
          <p className="text-gray-600 text-center max-w-md mb-4">
            Review and approve startup applications, assess risk scores, and manage the underwriting pipeline.
          </p>
          <p className="text-sm text-gray-500">(Coming in Phase 2)</p>
        </CardContent>
      </Card>
    </div>
  )
}
