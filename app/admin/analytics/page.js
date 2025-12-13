'use client'

import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  async function fetchAnalytics() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/analytics?days=${timeRange}`)
      if (!res.ok) throw new Error('Failed to fetch analytics')
      const data = await res.json()
      setAnalytics(data)
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
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    )
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#37322F] mb-2">Analytics & Reports</h1>
          <p className="text-gray-600">Generate reports, analyze trends, and track business metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#37322F]">
              ₹{((analytics?.totalPremium || 0) / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-gray-500 mt-1">Total Premium</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{analytics?.lossRatio?.toFixed(1) || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">Loss Ratio</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{analytics?.conversionRate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">Conversion Rate</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">₹{analytics?.avgPremium?.toFixed(0) || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Avg Premium</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Premium Trend */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Premium Collection Trend</CardTitle>
            <CardDescription>Daily premium collection over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.premiumTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="premium" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Policy Distribution */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Policy Distribution</CardTitle>
            <CardDescription>Policies by product type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.policyDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analytics?.policyDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Startups */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Top Startups by Premium</CardTitle>
            <CardDescription>Top performing startups</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.topStartups || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={100} />
                <Tooltip />
                <Bar dataKey="premium" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Claims Ratio */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Claims by Product Type</CardTitle>
            <CardDescription>Claims distribution across products</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.claimsByProduct || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="product" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
