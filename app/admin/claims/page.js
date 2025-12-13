'use client'

import { useEffect, useState } from 'react'
import { FileText, Search, Eye, Check, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ClaimDetailDialog from './components/ClaimDetailDialog'

export default function ClaimsPage() {
  const [loading, setLoading] = useState(true)
  const [claims, setClaims] = useState([])
  const [filteredClaims, setFilteredClaims] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchClaims()
  }, [])

  useEffect(() => {
    filterClaims()
  }, [searchTerm, statusFilter, claims])

  async function fetchClaims() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/claims')
      if (!res.ok) throw new Error('Failed to fetch claims')
      const data = await res.json()
      setClaims(data)
      setFilteredClaims(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function filterClaims() {
    let filtered = [...claims]

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.startupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.productName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter)
    }

    setFilteredClaims(filtered)
  }

  function formatDate(date) {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const statusColors = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    under_investigation: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    paid: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    disputed: 'bg-orange-50 text-orange-700 border-orange-200',
  }

  const priorityColors = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    low: 'bg-gray-50 text-gray-700 border-gray-200',
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
        <h1 className="text-3xl font-bold text-[#37322F] mb-2">Claims Management</h1>
        <p className="text-gray-600">Process and manage insurance claims, investigations, and payouts</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#37322F]">{claims.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total Claims</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {claims.filter((c) => c.status === 'new').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">New</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {claims.filter((c) => c.status === 'under_investigation').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Investigating</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {claims.filter((c) => c.status === 'approved').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Approved</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-700">
              {claims.filter((c) => c.status === 'paid').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Paid</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {claims.filter((c) => c.status === 'rejected').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by claim #, startup, or product..."
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
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="under_investigation">Under Investigation</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Claims Table */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>All Claims ({filteredClaims.length})</CardTitle>
          <CardDescription>
            {statusFilter !== 'all'
              ? `Showing ${filteredClaims.length} ${statusFilter.replace('_', ' ')} claims`
              : `Showing all ${filteredClaims.length} claims`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim #</TableHead>
                  <TableHead>Startup</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Filed Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No claims found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClaims.map((claim) => (
                    <TableRow key={claim.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">{claim.claimNumber}</TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">{claim.startupName}</div>
                      </TableCell>
                      <TableCell className="text-sm">{claim.productName}</TableCell>
                      <TableCell className="text-sm">{claim.claimType}</TableCell>
                      <TableCell className="font-semibold">
                        ₹{(claim.claimAmount || 0).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(claim.filedDate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[claim.status]}>
                          {claim.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priorityColors[claim.priority]}>
                          {claim.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ClaimDetailDialog claim={claim} onSuccess={fetchClaims} />
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
