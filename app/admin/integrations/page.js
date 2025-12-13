'use client'

import { Plug } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#37322F] mb-2">Integration Management</h1>
        <p className="text-gray-600">Manage external services, APIs, and webhook configurations</p>
      </div>

      <Card className="border-gray-200">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Plug className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connected Services</h3>
          <p className="text-gray-600 text-center max-w-md mb-4">
            Configure payment gateways, KYC providers, email services, and webhook endpoints.
          </p>
          <p className="text-sm text-gray-500">(Coming in Phase 3)</p>
        </CardContent>
      </Card>
    </div>
  )
}
