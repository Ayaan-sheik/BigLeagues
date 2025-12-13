'use client'

import { Package, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#37322F] mb-2">Product & Pricing Management</h1>
          <p className="text-gray-600">Manage insurance products, pricing rules, and coverage terms</p>
        </div>
        <Button className="bg-[#37322F] hover:bg-[#2a2521]">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card className="border-gray-200">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Products & Pricing</h3>
          <p className="text-gray-600 text-center max-w-md mb-4">
            Manage your insurance product catalog, pricing rules, eligibility criteria, and coverage configurations.
          </p>
          <p className="text-sm text-gray-500">(Coming in Phase 2)</p>
        </CardContent>
      </Card>
    </div>
  )
}
