'use client'

import { useState, useEffect } from 'react'
import { Eye, Check, X, MessageCircle, Edit, Calculator, DollarSign } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export default function ApplicationDetailDialog({ application, onSuccess }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingRisk, setEditingRisk] = useState(false)
  const [editingPremium, setEditingPremium] = useState(false)
  const [riskScore, setRiskScore] = useState(application.riskScore?.toString() || '')
  const [selectedProductId, setSelectedProductId] = useState(application.productId || '')
  const [actualPremium, setActualPremium] = useState(application.actualPremium?.toString() || '')
  const [recommendedPremium, setRecommendedPremium] = useState(application.recommendedPremium || null)
  const [products, setProducts] = useState([])
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    if (open) {
      fetchProducts()
    }
  }, [open])

  async function fetchProducts() {
    try {
      const res = await fetch('/api/admin/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.filter(p => p.status === 'active'))
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleCalculatePremium() {
    if (!selectedProductId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a product first',
        variant: 'destructive',
      })
      return
    }

    setCalculating(true)
    try {
      const res = await fetch('/api/admin/calculate-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          productId: selectedProductId,
        }),
      })

      if (!res.ok) throw new Error('Failed to calculate premium')
      
      const data = await res.json()
      setRecommendedPremium(data.recommendedPremium)
      
      // Also update the application with recommended premium
      await fetch(`/api/admin/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          recommendedPremium: data.recommendedPremium,
        }),
      })

      toast({
        title: 'Success',
        description: `Recommended premium: ₹${data.recommendedPremium}`,
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setCalculating(false)
    }
  }

  async function handleSetActualPremium() {
    if (!actualPremium || isNaN(parseInt(actualPremium))) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid premium amount',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualPremium: parseInt(actualPremium) }),
      })

      if (!res.ok) throw new Error('Failed to set premium')

      toast({
        title: 'Success',
        description: 'Premium set successfully',
      })

      setEditingPremium(false)
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
        variant: 'default',
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

  const selectedProduct = products.find(p => p.id === selectedProductId)

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
          {/* Company Info - Changed to Flexbox */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Company Information</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="text-sm font-medium">{application.companyName}</p>
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm text-gray-600">Industry</p>
                <p className="text-sm font-medium">{application.industry}</p>
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm text-gray-600">Founder</p>
                <p className="text-sm font-medium">{application.founderName}</p>
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm font-medium text-blue-600 truncate" title={application.founderEmail}>
                  {application.founderEmail}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Product Selection & Premium Calculation */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Product Selection & Premium</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product">Select Product</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose insurance product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (Base: ₹{product.basePrice})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Coverage Amount</Label>
                <p className="text-lg font-bold text-[#37322F]">
                  ₹{(application.coverageAmount / 100000).toFixed(1)}L
                </p>
              </div>
            </div>

            {selectedProductId && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Selected Product</p>
                    <p className="text-xs text-blue-700 mt-1">{selectedProduct?.name}</p>
                    <p className="text-xs text-blue-600 mt-1">Base Premium: ₹{selectedProduct?.basePrice}</p>
                  </div>
                  <Button
                    onClick={handleCalculatePremium}
                    disabled={calculating || !selectedProductId}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Calculator className="h-3 w-3 mr-2" />
                    {calculating ? 'Calculating...' : 'Calculate Premium'}
                  </Button>
                </div>

                {recommendedPremium && (
                  <div className="pt-2 border-t border-blue-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Recommended Premium</p>
                        <p className="text-xs text-blue-700">Based on risk assessment & coverage</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">₹{recommendedPremium}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actual Premium Setting (Info Required onwards) */}
            {(application.status === 'additional_info_required' || application.status === 'under_review' || application.status === 'approved') && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-green-900">Set Actual Premium</h4>
                  {!editingPremium && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPremium(true)}
                    >
                      <Edit className="h-3 w-3 mr-2" />
                      {application.actualPremium ? 'Edit Premium' : 'Set Premium'}
                    </Button>
                  )}
                </div>

                {editingPremium ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="actualPremium">Actual Premium (₹)</Label>
                      <Input
                        id="actualPremium"
                        type="number"
                        value={actualPremium}
                        onChange={(e) => setActualPremium(e.target.value)}
                        placeholder={recommendedPremium ? `Recommended: ₹${recommendedPremium}` : 'Enter premium amount'}
                      />
                      {recommendedPremium && (
                        <p className="text-xs text-green-700">Recommended: ₹{recommendedPremium}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSetActualPremium}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {loading ? 'Saving...' : 'Save Premium'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingPremium(false)
                          setActualPremium(application.actualPremium?.toString() || '')
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  application.actualPremium && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">Actual Premium Set:</span>
                      <p className="text-2xl font-bold text-green-900">₹{application.actualPremium}</p>
                    </div>
                  )
                )}
              </div>
            )}
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

        <DialogFooter className="flex gap-2 flex-wrap">
          {!editingRisk && !editingPremium && (application.status === 'new' || application.status === 'under_review') && (
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
          {!editingRisk && !editingPremium && (application.status === 'approved' || application.status === 'rejected' || application.status === 'additional_info_required') && (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
