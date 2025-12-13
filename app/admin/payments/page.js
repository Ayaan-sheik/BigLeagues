'use client'

import { useEffect, useState } from 'react'
import { CreditCard, AlertCircle, TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [hasDodoKeys, setHasDodoKeys] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    checkDodoConfiguration()
    fetchTransactions()
  }, [])

  async function checkDodoConfiguration() {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const settings = await res.json()
        setHasDodoKeys(!!(settings?.dodoApiKey && settings?.dodoSecretKey))
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchTransactions() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/payments/transactions')
      if (!res.ok) throw new Error('Failed to fetch transactions')
      const data = await res.json()
      setTransactions(data.transactions)
      setStats(data.stats)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date) {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatCurrency(amount) {
    return `₹${(amount || 0).toLocaleString('en-IN')}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-[#37322F]">{formatCurrency(stats?.totalPremium || 0)}</div>
            <p className="text-xs text-gray-500 mt-1">Total Premium Collected</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-[#37322F]">{stats?.totalTransactions || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Total Transactions</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats?.settledCount || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Settled</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendingCount || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Pending Settlement</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transaction Stream</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          <TabsTrigger value="payouts">Claim Payouts</TabsTrigger>
        </TabsList>

        {/* Transaction Stream */}
        <TabsContent value="transactions">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Transaction Stream</CardTitle>
              <CardDescription>Real-time premium collection from Dodo payment gateway</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Gateway ID</TableHead>
                      <TableHead>Startup</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Product Price</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((txn) => (
                        <TableRow key={txn.id}>
                          <TableCell className="text-sm">{formatDate(txn.createdAt)}</TableCell>
                          <TableCell className="font-mono text-xs">{txn.gatewayTransactionId}</TableCell>
                          <TableCell className="font-medium">{txn.startupName}</TableCell>
                          <TableCell className="text-sm">{txn.productName}</TableCell>
                          <TableCell>{formatCurrency(txn.productPrice)}</TableCell>
                          <TableCell className="font-semibold text-green-600">{formatCurrency(txn.premium)}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(txn.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                txn.settlementStatus === 'completed'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              }
                            >
                              {txn.settlementStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reconciliation */}
        <TabsContent value="reconciliation">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Daily Settlement Summary</CardTitle>
              <CardDescription>Expected vs received premium reconciliation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 mb-1">Expected Premium</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats?.totalPremium || 0)}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 mb-1">Received Premium</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(stats?.settledPremium || 0)}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700 mb-1">Pending Settlement</p>
                    <p className="text-2xl font-bold text-yellow-900">{formatCurrency(stats?.pendingPremium || 0)}</p>
                  </div>
                </div>

                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Detailed reconciliation reports coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claim Payouts */}
        <TabsContent value="payouts">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Claim Payouts</CardTitle>
              <CardDescription>Process and track insurance claim payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16 text-gray-500">
                <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Claim Payout Processing</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  View and process approved claim payouts, track payment status, and manage refunds.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
