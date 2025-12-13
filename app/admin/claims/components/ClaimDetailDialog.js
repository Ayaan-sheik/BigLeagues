'use client'

import { useState } from 'react'
import { Eye, Check, X, DollarSign } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

export default function ClaimDetailDialog({ claim, onSuccess }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [approvedAmount, setApprovedAmount] = useState(claim.claimAmount?.toString() || '')
  const [notes, setNotes] = useState('')

  async function handleDecision(decision) {
    setLoading(true)

    try {
      const payload = {
        status: decision,
        ...(decision === 'approved' && { approvedAmount: parseInt(approvedAmount) }),
        ...(notes && { notes }),
      }

      const res = await fetch(`/api/admin/claims/${claim.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to update claim')

      toast({
        title: 'Success',
        description: `Claim ${decision}`,
      })

      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date) {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{claim.claimNumber}</DialogTitle>
          <DialogDescription>{claim.startupName} - {claim.productName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Claim Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Claim Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Claim Type</p>
                <p className="text-sm font-medium">{claim.claimType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Incident Date</p>
                <p className="text-sm font-medium">{formatDate(claim.incidentDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Filed Date</p>
                <p className="text-sm font-medium">{formatDate(claim.filedDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <Badge
                  variant="outline"
                  className={
                    claim.priority === 'high'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : claim.priority === 'medium'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }
                >
                  {claim.priority}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Description</h3>
            <p className="text-sm text-gray-700">{claim.description}</p>
          </div>

          <Separator />

          {/* Amounts */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Financial Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Claim Amount</p>
                <p className="text-2xl font-bold text-[#37322F]">
                  ₹{(claim.claimAmount || 0).toLocaleString('en-IN')}
                </p>
              </div>
              {claim.approvedAmount !== null && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">Approved Amount</p>
                  <p className="text-2xl font-bold text-green-800">
                    ₹{(claim.approvedAmount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Status & Assignment */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Status</p>
              <Badge
                className="mt-1"
                variant="outline"
              >
                {claim.status.replace('_', ' ')}
              </Badge>
            </div>
            {claim.assignedTo && (
              <div>
                <p className="text-sm text-gray-600">Assigned To</p>
                <p className="text-sm font-medium">{claim.assignedTo}</p>
              </div>
            )}
          </div>

          {/* Decision Panel (if applicable) */}
          {(claim.status === 'new' || claim.status === 'under_investigation') && (
            <>
              <Separator />
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900">Decision Panel</h3>
                <div className="space-y-2">
                  <Label htmlFor="approvedAmount">Approved Amount (₹)</Label>
                  <Input
                    id="approvedAmount"
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    placeholder="Enter approved amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about the decision"
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {claim.status === 'new' || claim.status === 'under_investigation' ? (
            <>
              <Button
                variant="outline"
                onClick={() => handleDecision('under_investigation')}
                disabled={loading || claim.status === 'under_investigation'}
              >
                {claim.status === 'under_investigation' ? 'In Investigation' : 'Start Investigation'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDecision('rejected')}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleDecision('approved')}
                disabled={loading || !approvedAmount}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          ) : claim.status === 'approved' ? (
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleDecision('paid')}
              disabled={loading}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
