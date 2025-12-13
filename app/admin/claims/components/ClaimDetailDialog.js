'use client'

import { useState } from 'react'
import { Eye, Check, X, DollarSign, ArrowLeft, AlertTriangle } from 'lucide-react'
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

  // Status flow: new → under_investigation → approved → paid / rejected / disputed
  // Can also go back: approved → under_investigation, paid → approved
  
  function getAvailableActions() {
    const actions = []
    
    switch (claim.status) {
      case 'new':
        actions.push(
          { label: 'Start Investigation', status: 'under_investigation', icon: Eye, variant: 'outline' },
          { label: 'Reject', status: 'rejected', icon: X, variant: 'destructive' }
        )
        break
        
      case 'under_investigation':
        actions.push(
          { label: 'Approve', status: 'approved', icon: Check, variant: 'default', color: 'bg-green-600 hover:bg-green-700' },
          { label: 'Reject', status: 'rejected', icon: X, variant: 'destructive' },
          { label: 'Dispute', status: 'disputed', icon: AlertTriangle, variant: 'outline' }
        )
        break
        
      case 'approved':
        actions.push(
          { label: 'Mark as Paid', status: 'paid', icon: DollarSign, variant: 'default', color: 'bg-blue-600 hover:bg-blue-700' },
          { label: 'Back to Investigation', status: 'under_investigation', icon: ArrowLeft, variant: 'outline' }
        )
        break
        
      case 'paid':
        actions.push(
          { label: 'Revert to Approved', status: 'approved', icon: ArrowLeft, variant: 'outline' }
        )
        break
        
      case 'rejected':
        // Can reopen for investigation
        actions.push(
          { label: 'Reopen Investigation', status: 'under_investigation', icon: Eye, variant: 'outline' }
        )
        break
        
      case 'disputed':
        actions.push(
          { label: 'Back to Investigation', status: 'under_investigation', icon: ArrowLeft, variant: 'outline' },
          { label: 'Reject', status: 'rejected', icon: X, variant: 'destructive' }
        )
        break
    }
    
    return actions
  }

  async function handleStatusChange(newStatus) {
    // Validate approved amount if approving
    if (newStatus === 'approved' && !approvedAmount) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an approved amount',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const payload = {
        status: newStatus,
        ...(newStatus === 'approved' && { approvedAmount: parseInt(approvedAmount) }),
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
        description: `Claim status updated to ${newStatus.replace('_', ' ')}`,
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

  const availableActions = getAvailableActions()

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
              <Badge className="mt-1" variant="outline">
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
          {claim.status === 'under_investigation' && (
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
          {availableActions.map((action) => (
            <Button
              key={action.status}
              variant={action.variant}
              className={action.color}
              onClick={() => handleStatusChange(action.status)}
              disabled={loading}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          ))}
          {availableActions.length === 0 && (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
