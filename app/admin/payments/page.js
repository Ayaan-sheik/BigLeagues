'use client'

import { useEffect, useState } from 'react'
import { CreditCard, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [hasDodoKeys, setHasDodoKeys] = useState(false)

  useEffect(() => {
    checkDodoConfiguration()
  }, [])

  async function checkDodoConfiguration() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const settings = await res.json()
        setHasDodoKeys(!!(settings?.dodoApiKey && settings?.dodoSecretKey))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#37322F] mb-2">Payments & Reconciliation</h1>
        <p className="text-gray-600">Monitor premium collection, settlements, and claim payouts</p>
      </div>

      {/* Dodo Configuration Error */}
      {!hasDodoKeys && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">Dodo Payment Gateway Not Configured</h3>
                <p className="text-sm text-orange-700 mb-3">
                  Premium collection and payment processing features require Dodo API keys to be configured. Please add
                  your Dodo credentials in Settings to enable payment functionality.
                </p>
                <a
                  href="/admin/settings"
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 underline"
                >
                  Go to Settings →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Premium Collection</CardTitle>
          <CardDescription>Real-time transaction stream and settlement tracking</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CreditCard className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Processing</h3>
          <p className="text-gray-600 text-center max-w-md mb-4">
            Monitor premium collection from Dodo payment gateway, track settlements, and reconcile transactions.
          </p>
          <p className="text-sm text-gray-500">(Coming in Phase 2)</p>
        </CardContent>
      </Card>
    </div>
  )
}
