'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  TrendingUp,
  FileText,
  AlertCircle,
  CreditCard,
  MessageSquare,
  Edit,
  Ban,
  CheckCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'

export default function StartupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (params.id) {
      fetchStartupDetails()
    }
  }, [params.id])

  async function fetchStartupDetails() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/startups/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch startup details')
      const result = await res.json()
      setData(result)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date) {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function formatCurrency(amount) {
    return `₹${(amount / 1000).toFixed(1)}K`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Startup</h3>
          <p className="text-gray-600">{error || 'Startup not found'}</p>
          <Button onClick={() => router.push('/admin/startups')} className="mt-4">
            Back to Startups
          </Button>
        </div>
      </div>
    )
  }

  const { startup, policies, transactions, claims } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/startups')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#37322F]">{startup.name}</h1>
          <p className="text-gray-600">{startup.industry}</p>
        </div>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive">
          <Ban className="h-4 w-4 mr-2" />
          Suspend
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-600">Total Policies</span>
            </div>
            <div className="text-2xl font-bold text-[#37322F]">{startup.totalPolicies || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-gray-600">Premium MTD</span>
            </div>
            <div className="text-2xl font-bold text-[#37322F]">
              {formatCurrency(startup.totalPremiumMTD || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-medium text-gray-600">Risk Score</span>
            </div>
            <div className="text-2xl font-bold text-[#37322F]">{startup.riskScore || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-gray-600">Status</span>
            </div>
            <Badge className="mt-1">{startup.status}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Company Profile</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="policies">Policies ({policies.length})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
          <TabsTrigger value="claims">Claims ({claims.length})</TabsTrigger>
          <TabsTrigger value="communication">Communication Log</TabsTrigger>
        </TabsList>

        {/* Company Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Company Name</p>
                  <p className="text-base text-gray-900">{startup.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Industry</p>
                  <p className="text-base text-gray-900">{startup.industry}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Founder</p>
                  <p className="text-base text-gray-900">{startup.founderName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-base text-gray-900">{startup.founderEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Team Size</p>
                  <p className="text-base text-gray-900">{startup.teamSize || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Funding Stage</p>
                  <p className="text-base text-gray-900">{startup.fundingStage || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-base text-gray-900">₹{(startup.revenue || 0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Founded</p>
                  <p className="text-base text-gray-900">{formatDate(startup.foundedDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="risk" className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Risk Score Analysis</CardTitle>
              <CardDescription>Comprehensive risk evaluation based on multiple factors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl font-bold text-[#37322F]">{startup.riskScore || 'N/A'}</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Risk Score</p>
                  <p className="text-xs text-gray-500">Scale: 0-100 (lower is better)</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Risk Factors:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Industry Risk</p>
                    <p className="text-sm font-semibold">Medium</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Funding Stage</p>
                    <p className="text-sm font-semibold">Low</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Revenue Stability</p>
                    <p className="text-sm font-semibold">Good</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Historical Claims</p>
                    <p className="text-sm font-semibold">Low</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Active Policies</CardTitle>
              <CardDescription>All insurance policies for this startup</CardDescription>
            </CardHeader>
            <CardContent>
              {policies.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No policies found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className="font-medium">{policy.productName}</TableCell>
                        <TableCell>₹{(policy.coverageAmount || 0).toLocaleString('en-IN')}</TableCell>
                        <TableCell>₹{policy.premium || 0}</TableCell>
                        <TableCell>{formatDate(policy.startDate)}</TableCell>
                        <TableCell>{formatDate(policy.endDate)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {policy.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent payment transactions and premium splits</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No transactions found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Product Price</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Gateway ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="text-sm">{formatDate(txn.createdAt)}</TableCell>
                        <TableCell className="font-medium text-sm">{txn.productName}</TableCell>
                        <TableCell>₹{(txn.productPrice || 0).toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-green-600 font-medium">₹{txn.premium || 0}</TableCell>
                        <TableCell className="font-semibold">₹{(txn.totalAmount || 0).toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {txn.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-gray-500">{txn.gatewayTransactionId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims" className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Claims Filed</CardTitle>
              <CardDescription>All insurance claims for this startup</CardDescription>
            </CardHeader>
            <CardContent>
              {claims.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No claims found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim #</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Filed Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-mono text-sm">{claim.claimNumber}</TableCell>
                        <TableCell>{claim.productName}</TableCell>
                        <TableCell className="text-sm">{claim.claimType}</TableCell>
                        <TableCell className="font-semibold">₹{(claim.claimAmount || 0).toLocaleString('en-IN')}</TableCell>
                        <TableCell>{formatDate(claim.filedDate)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              claim.status === 'paid'
                                ? 'bg-green-50 text-green-700'
                                : claim.status === 'approved'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-yellow-50 text-yellow-700'
                            }
                          >
                            {claim.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              claim.priority === 'high'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-gray-50 text-gray-700'
                            }
                          >
                            {claim.priority}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Log Tab */}
        <TabsContent value="communication" className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>All interactions and notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No communication logs yet</p>
                <Button variant="outline" className="mt-4">
                  Add Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
