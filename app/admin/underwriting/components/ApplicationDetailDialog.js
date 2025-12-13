'use client'

import { useState } from 'react'
import { Eye, Check, X, MessageCircle, Edit } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'

export default function ApplicationDetailDialog({ application, onSuccess }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingRisk, setEditingRisk] = useState(false)
  const [riskScore, setRiskScore] = useState(application.riskScore?.toString() || '')

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
        description: `Application ${decision.replace('_', ' ')}`,
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

  async function handleUpdateRisk() {
    if (!riskScore || isNaN(parseInt(riskScore))) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid risk score (0-100)',
        variant: 'destructive',
      })
      return
    }

    const score = parseInt(riskScore)
    if (score < 0 || score > 100) {
      toast({
        title: 'Validation Error',
        description: 'Risk score must be between 0 and 100',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/admin/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskScore: score }),
      })

      if (!res.ok) throw new Error('Failed to update risk score')

      toast({
        title: 'Success',
        description: 'Risk score updated successfully',
      })

      setEditingRisk(false)
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

          {/* Risk Assessment - CRUD */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Risk Assessment</h3>
              {!editingRisk && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingRisk(true)}
                >
                  <Edit className="h-3 w-3 mr-2" />
                  Update Risk
                </Button>
              )}
            </div>

            {editingRisk ? (
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="riskScore">Risk Score (0-100)</Label>
                  <Input
                    id="riskScore"
                    type="number"
                    min="0"
                    max="100"
                    value={riskScore}
                    onChange={(e) => setRiskScore(e.target.value)}
                    placeholder="Enter risk score"
                  />
                  <p className="text-xs text-gray-500">
                    Lower scores indicate lower risk (0-29: Low, 30-49: Medium, 50+: High)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateRisk}
                    disabled={loading}
                    className="bg-[#37322F] hover:bg-[#2a2521]"
                  >
                    {loading ? 'Saving...' : 'Save Risk Score'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingRisk(false)
                      setRiskScore(application.riskScore?.toString() || '')
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
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
                  <p className="text-sm text-gray-500">Risk assessment pending - Click "Update Risk" to add</p>
                )}

                {application.assignedUnderwriter && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">Assigned To:</p>
                    <p className="text-sm font-medium">{application.assignedUnderwriter}</p>
                  </div>
                )}
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
          {!editingRisk && (application.status === 'new' || application.status === 'under_review') && (
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
          )}
          {!editingRisk && (application.status === 'approved' || application.status === 'rejected' || application.status === 'additional_info_required') && (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
