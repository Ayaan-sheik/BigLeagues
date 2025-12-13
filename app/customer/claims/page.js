'use client'

import { useEffect, useState } from 'react'
import { FileText, Plus, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function ClaimsPage() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    policyId: '',
    incidentDate: '',
    description: '',
    claimAmount: '',
  })

  useEffect(() => {
    fetchClaims()
  }, [])

  async function fetchClaims() {
    try {
      setLoading(true)
      const res = await fetch('/api/customer/claims')
      if (!res.ok) throw new Error('Failed to fetch claims')
      const data = await res.json()
      setClaims(data.claims || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await fetch('/api/customer/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed to file claim')
      setOpen(false)
      setFormData({ policyId: '', incidentDate: '', description: '', claimAmount: '' })
      fetchClaims()
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleWithdrawClaim(claimId) {
    if (!confirm('Are you sure you want to withdraw this claim? This action cannot be undone.')) {
      return
    }
    
    try {
      const res = await fetch(`/api/customer/claims/${claimId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to withdraw claim')
      alert('Claim withdrawn successfully')
      fetchClaims()
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleWithdrawClaim(claimId) {
    if (!confirm('Are you sure you want to withdraw this claim? This action cannot be undone.')) {
      return
    }
    
    try {
      const res = await fetch(`/api/customer/claims/${claimId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to withdraw claim')
      fetchClaims()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'destructive'
      case 'under_investigation': return 'default'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claims Management</h1>
          <p className="text-gray-600 mt-1">File and track your insurance claims</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              File New Claim
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>File a New Claim</DialogTitle>
              <DialogDescription>
                Provide details about your claim below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="policyId">Policy ID</Label>
                <Input
                  id="policyId"
                  value={formData.policyId}
                  onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="incidentDate">Incident Date</Label>
                <Input
                  id="incidentDate"
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="claimAmount">Claim Amount (₹)</Label>
                <Input
                  id="claimAmount"
                  type="number"
                  value={formData.claimAmount}
                  onChange={(e) => setFormData({ ...formData, claimAmount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Submit Claim</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {claims.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Claims Filed</h3>
            <p className="text-gray-600 mb-4">You haven&apos;t filed any claims yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Claim #{claim.claimNumber}</CardTitle>
                    <CardDescription>Filed on {new Date(claim.createdAt).toLocaleDateString()}</CardDescription>
                  </div>
                  <Badge variant={getStatusColor(claim.status)}>
                    {claim.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Claim Amount</p>
                    <p className="text-lg font-bold">₹{claim.claimAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Incident Date</p>
                    <p className="text-lg font-semibold">{new Date(claim.incidentDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-sm">{claim.description}</p>
                </div>
                {claim.adjusterNotes && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900">Adjuster Notes:</p>
                    <p className="text-sm text-blue-800">{claim.adjusterNotes}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View Details</Button>
                  {(claim.status === 'new' || claim.status === 'info_requested') && (
                    <>
                      <Button variant="outline" size="sm">Update Claim</Button>
                      {claim.status === 'new' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleWithdrawClaim(claim.id)}
                        >
                          Withdraw
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
