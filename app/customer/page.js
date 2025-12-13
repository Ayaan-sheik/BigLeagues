'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  Shield,
  DollarSign,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  async function fetchDashboardStats() {
    try {
      setLoading(true)
      const res = await fetch('/api/customer/dashboard/stats')
      if (!res.ok) throw new Error('Failed to fetch dashboard stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const kpis = [
    {
      title: 'Total Coverage',
      value: stats?.totalCoverage ? `₹${((stats.totalCoverage) / 100000).toFixed(1)}L` : '₹0',
      change: '',
      trend: 'neutral',
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Premium Paid (MTD)',
      value: stats?.premiumPaidMTD ? `₹${((stats.premiumPaidMTD) / 1000).toFixed(1)}K` : '₹0',
      change: '',
      trend: 'neutral',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Policies',
      value: stats?.activePolicies || 0,
      change: '',
      trend: 'neutral',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Risk Score',
      value: stats?.riskScore || 'N/A',
      change: '',
      trend: 'neutral',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Home</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your insurance overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              {kpi.change && (
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {kpi.trend === 'up' && <ArrowUp className="h-3 w-3 text-green-600 mr-1" />}
                  {kpi.trend === 'down' && <ArrowDown className="h-3 w-3 text-red-600 mr-1" />}
                  <span className={kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                    {kpi.change}
                  </span>
                  <span className="ml-1">from last month</span>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest premium collections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentTransactions?.length > 0 ? (
                stats.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{tx.productSold}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">₹{tx.premiumAmount}</p>
                      <p className="text-xs text-gray-500">Sale: ₹{tx.saleAmount}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent transactions</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claims Status</CardTitle>
            <CardDescription>Your recent claims</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentClaims?.length > 0 ? (
                stats.recentClaims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{claim.claimType}</p>
                      <p className="text-xs text-gray-500">{new Date(claim.date).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={claim.status === 'approved' ? 'success' : claim.status === 'rejected' ? 'destructive' : 'default'}>
                      {claim.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent claims</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
