'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  async function fetchDashboardStats() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/dashboard/stats')
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
      title: 'Total Active Policies',
      value: stats?.totalPolicies || 0,
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Premium Collected (MTD)',
      value: `₹${((stats?.premiumMTD || 0) / 1000).toFixed(1)}K`,
      change: '+18%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Startups',
      value: stats?.activeStartups || 0,
      change: '+8%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Pending Claims',
      value: stats?.pendingClaims || 0,
      change: '-5%',
      trend: 'down',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#37322F] mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your insurance operations and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#37322F]">{kpi.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {kpi.trend === 'up' ? (
                  <ArrowUp className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-600" />
                )}
                <span
                  className={`text-xs font-medium ${
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {kpi.change}
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base">Approval Queue</CardTitle>
            <CardDescription>Applications pending review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#37322F]">{stats?.approvalQueue || 0}</div>
            <p className="text-xs text-gray-500 mt-2">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base">Avg Premium / Transaction</CardTitle>
            <CardDescription>Per-transaction average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#37322F]">
              ₹{(stats?.avgPremiumPerTxn || 0).toFixed(0)}
            </div>
            <p className="text-xs text-gray-500 mt-2">Across all products</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base">Premium YTD</CardTitle>
            <CardDescription>Year-to-date collection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#37322F]">
              ₹{((stats?.premiumYTD || 0) / 100000).toFixed(1)}L
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">On track for annual goal</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Panel */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Pending items that require your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Pending Approvals</p>
                  <p className="text-xs text-gray-600">Review {stats?.approvalQueue || 0} applications</p>
                </div>
              </div>
              <Badge className="bg-orange-500">Action Required</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">New Applications</p>
                  <p className="text-xs text-gray-600">{stats?.newApplications || 0} new submissions</p>
                </div>
              </div>
              <Badge variant="outline">Review</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Urgent Claims</p>
                  <p className="text-xs text-gray-600">{stats?.urgentClaims || 0} high-priority claims</p>
                </div>
              </div>
              <Badge variant="destructive">Urgent</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Startups */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Top Startups by Premium</CardTitle>
          <CardDescription>Top 5 startups by premium volume (MTD)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.topStartups?.map((startup, idx) => (
              <div key={startup.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{startup.name}</p>
                    <p className="text-xs text-gray-500">{startup.industry}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#37322F]">₹{(startup.premium / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-gray-500">{startup.policies} policies</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
