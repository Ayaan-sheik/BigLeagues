'use client'

import { useEffect, useState } from 'react'
import { Shield, Download, Plus, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function PoliciesPage() {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPolicies()
  }, [])

  async function fetchPolicies() {
    try {
      setLoading(true)
      const res = await fetch('/api/customer/policies')
      if (!res.ok) throw new Error('Failed to fetch policies')
      const data = await res.json()
      setPolicies(data.policies || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Policies</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Policies</h1>
          <p className="text-gray-600 mt-1">Manage your insurance coverage</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Application
        </Button>
      </div>

      {policies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Policies Yet</h3>
            <p className="text-gray-600 mb-4">Start by applying for your first insurance policy</p>
            <Button>Apply Now</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {policies.map((policy) => (
            <Card key={policy.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{policy.productName}</CardTitle>
                    <CardDescription>Policy #{policy.policyNumber}</CardDescription>
                  </div>
                  <Badge variant={policy.status === 'active' ? 'success' : 'default'}>
                    {policy.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Coverage Amount</p>
                  <p className="text-2xl font-bold">₹{(policy.coverageAmount / 100000).toFixed(1)}L</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Premium</p>
                    <p className="font-semibold">₹{policy.premiumAmount}/month</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Deductible</p>
                    <p className="font-semibold">₹{policy.deductible}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
