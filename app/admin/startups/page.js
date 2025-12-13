'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const statusColors = {
  active: 'bg-green-100 text-green-700 border-green-200',
  lead: 'bg-gray-100 text-gray-700 border-gray-200',
  kyc: 'bg-blue-100 text-blue-700 border-blue-200',
  underwriting: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  suspended: 'bg-red-100 text-red-700 border-red-200',
}

const riskScoreColor = (score) => {
  if (score < 30) return 'text-green-600 bg-green-50 border-green-200'
  if (score < 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

export default function StartupsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [startups, setStartups] = useState([])
  const [filteredStartups, setFilteredStartups] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStartups()
  }, [])

  useEffect(() => {
    filterStartups()
  }, [searchTerm, statusFilter, startups])

  async function fetchStartups() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/startups')
      if (!res.ok) throw new Error('Failed to fetch startups')
      const data = await res.json()
      setStartups(data)
      setFilteredStartups(data)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function filterStartups() {
    let filtered = [...startups]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.founderName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === statusFilter)
    }

    setFilteredStartups(filtered)
  }

  function formatDate(date) {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Startups</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#37322F] mb-2">Startup Management</h1>
          <p className="text-gray-600">Manage your startup relationships and policies</p>
        </div>
        <Button className="bg-[#37322F] hover:bg-[#2a2521]">
          <Plus className="h-4 w-4 mr-2" />
          Add Startup
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, industry, or founder..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="kyc">KYC</SelectItem>
                <SelectItem value="underwriting">Underwriting</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#37322F]">{startups.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total Startups</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {startups.filter((s) => s.status === 'active').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {startups.filter((s) => s.onboardingStatus === 'kyc').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">In KYC</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {startups.filter((s) => s.status === 'suspended').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Suspended</p>
          </CardContent>
        </Card>
      </div>

      {/* Startups Table */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>All Startups ({filteredStartups.length})</CardTitle>
          <CardDescription>
            {statusFilter !== 'all'
              ? `Showing ${filteredStartups.length} ${statusFilter} startups`
              : `Showing all ${filteredStartups.length} startups`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Startup Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Policies</TableHead>
                  <TableHead>Premium MTD</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStartups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No startups found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStartups.map((startup) => (
                    <TableRow
                      key={startup.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/admin/startups/${startup.id}`)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{startup.name}</div>
                          <div className="text-xs text-gray-500">{startup.founderName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{startup.industry}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[startup.status] || statusColors.active}
                        >
                          {startup.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={riskScoreColor(startup.riskScore)}>
                          {startup.riskScore}
                        </Badge>
                      </TableCell>
                      <TableCell>{startup.totalPolicies || 0}</TableCell>
                      <TableCell>₹{((startup.totalPremiumMTD || 0) / 1000).toFixed(1)}K</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(startup.lastActivity)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/admin/startups/${startup.id}`)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-red-600">
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
