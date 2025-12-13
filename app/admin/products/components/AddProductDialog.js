'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export default function AddProductDialog({ onSuccess }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    coverageMin: '',
    coverageMax: '',
    status: 'active',
  })

  async function handleSubmit(e) {
    e.preventDefault()
    
    const minCoverage = parseInt(formData.coverageMin) || 0
    const maxCoverage = parseInt(formData.coverageMax) || 0
    
    if (minCoverage >= maxCoverage) {
      toast({
        title: 'Validation Error',
        description: 'Minimum coverage must be less than maximum coverage',
        variant: 'destructive',
      })
      return
    }
    
    setLoading(true)

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          basePrice: parseInt(formData.basePrice) || 0,
          coverageMin: minCoverage,
          coverageMax: maxCoverage,
        }),
      })

      if (!res.ok) throw new Error('Failed to create product')

      toast({
        title: 'Success',
        description: 'Product created successfully',
      })

      setOpen(false)
      setFormData({
        name: '',
        description: '',
        basePrice: '',
        coverageMin: '',
        coverageMax: '',
        status: 'active',
      })

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
        <Button className="bg-[#37322F] hover:bg-[#2a2521]">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Create a new insurance product with pricing and coverage details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Product Liability Insurance"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the insurance product and what it covers"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Premium (₹) *</Label>
              <Input
                id="basePrice"
                type="number"
                required
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                placeholder="15"
              />
              <p className="text-xs text-gray-500">Per transaction or unit</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coverageMin">Minimum Coverage (₹) *</Label>
              <Input
                id="coverageMin"
                type="number"
                required
                value={formData.coverageMin}
                onChange={(e) => setFormData({ ...formData, coverageMin: e.target.value })}
                placeholder="100000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverageMax">Maximum Coverage (₹) *</Label>
              <Input
                id="coverageMax"
                type="number"
                required
                value={formData.coverageMax}
                onChange={(e) => setFormData({ ...formData, coverageMax: e.target.value })}
                placeholder="5000000"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#37322F] hover:bg-[#2a2521]">
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
