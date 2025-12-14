'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Download, Plus, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function PoliciesPage() {
  const router = useRouter()
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
        <Button onClick={() => router.push('/customer/policies/apply')}>
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
          {policies.map((policy) => {
            // Determine badge color based on status
            const getBadgeVariant = (status) => {
              if (status === 'active') return 'default'
              if (status === 'rejected') return 'destructive'
              if (status === 'pending') return 'secondary'
              if (status === 'info_required') return 'outline'
              return 'secondary'
            }

            const getStatusDisplay = (status) => {
              if (status === 'active') return 'Approved'
              if (status === 'rejected') return 'Rejected'
              if (status === 'pending') return 'Under Review'
              if (status === 'info_required') return 'Info Required'
              return 'Pending'
            }

            return (
              <Card key={policy.id} className={policy.status === 'rejected' ? 'border-red-200' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{policy.productName}</CardTitle>
                      <CardDescription className="mt-1">
                        Application #{policy.applicationNumber}
                      </CardDescription>
                      {policy.companyName && (
                        <p className="text-xs text-gray-500 mt-1">{policy.companyName}</p>
                      )}
                    </div>
                    <Badge 
                      variant={getBadgeVariant(policy.status)}
                      className={
                        policy.status === 'active' ? 'bg-green-100 text-green-800' :
                        policy.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        policy.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }
                    >
                      {getStatusDisplay(policy.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Coverage Amount</p>
                      <p className="text-lg font-bold">₹{policy.coverageAmount ? (policy.coverageAmount / 100000).toFixed(1) : '0'}L</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Premium</p>
                      <p className="text-lg font-bold">₹{policy.premium || 0}</p>
                    </div>
                  </div>

                  {policy.status === 'rejected' && policy.underwriterNotes && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-xs font-semibold text-red-800 mb-1">Rejection Reason:</p>
                      <p className="text-xs text-red-700">{policy.underwriterNotes}</p>
                    </div>
                  )}

                  {policy.status === 'info_required' && policy.underwriterNotes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-xs font-semibold text-blue-800 mb-1">Required Information:</p>
                      <p className="text-xs text-blue-700">{policy.underwriterNotes}</p>
                    </div>
                  )}

                  {policy.status === 'active' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Download Policy
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  )}

                  {(policy.status === 'pending' || policy.status === 'info_required') && (
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-xs text-gray-600">
                        Your application is being reviewed. You'll be notified once a decision is made.
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Applied: {new Date(policy.createdAt).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
