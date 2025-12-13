'use client'

import { useState } from 'react'
import { Eye, Check, X, MessageCircle } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'

export default function ApplicationDetailDialog({ application, onSuccess }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDecision(decision) {
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decision }),
      })

      if (!res.ok) throw new Error('Failed to update application')

      toast({
        title: 'Success',
        description: `Application ${decision}`,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Eye className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{application.companyName}</DialogTitle>
          <DialogDescription>Application #{application.applicationNumber}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Company Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Company Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="text-sm font-medium">{application.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Industry</p>
                <p className="text-sm font-medium">{application.industry}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Founder</p>
                <p className="text-sm font-medium">{application.founderName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm font-medium text-blue-600">{application.founderEmail}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Coverage Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Requested Coverage</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Coverage Type</p>
                <p className="text-sm font-medium">{application.requestedCoverage}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Coverage Amount</p>
                <p className="text-lg font-bold text-[#37322F]">
                  ₹{(application.coverageAmount / 100000).toFixed(1)}L
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Risk Assessment */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Risk Assessment</h3>
            {application.riskScore !== null ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Risk Score:</span>
                <Badge
                  variant="outline"
                  className={
                    application.riskScore < 30
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : application.riskScore < 50
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }
                >
                  {application.riskScore}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Risk assessment pending</p>
            )}

            {application.assignedUnderwriter && (
              <div>
                <p className="text-sm text-gray-600">Assigned To:</p>
                <p className="text-sm font-medium">{application.assignedUnderwriter}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Current Status:</span>
            <Badge>{application.status.replace('_', ' ')}</Badge>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {application.status === 'new' || application.status === 'under_review' ? (
            <>
              <Button
                variant="outline"
                onClick={() => handleDecision('additional_info_required')}
                disabled={loading}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Request Info
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
                disabled={loading}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
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
