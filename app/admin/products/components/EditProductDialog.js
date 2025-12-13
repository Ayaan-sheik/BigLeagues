'use client'

import { useState, useEffect } from 'react'
import { Edit } from 'lucide-react'
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

export default function EditProductDialog({ product, onSuccess, trigger }) {
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

  useEffect(() => {
    if (product && open) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        basePrice: product.basePrice?.toString() || '',
        coverageMin: product.coverageMin?.toString() || '',
        coverageMax: product.coverageMax?.toString() || '',
        status: product.status || 'active',
      })
    }
  }, [product, open])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          basePrice: parseInt(formData.basePrice) || 0,
          coverageMin: parseInt(formData.coverageMin) || 0,
          coverageMax: parseInt(formData.coverageMax) || 0,
        }),
      })

      if (!res.ok) throw new Error('Failed to update product')

      toast({
        title: 'Success',
        description: 'Product updated successfully',
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
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update product information and pricing</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Product Name *</Label>
            <Input
              id="edit-name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-basePrice">Base Premium (₹) *</Label>
              <Input
                id="edit-basePrice"
                type="number"
                required
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
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
              <Label htmlFor="edit-coverageMin">Minimum Coverage (₹) *</Label>
              <Input
                id="edit-coverageMin"
                type="number"
                required
                value={formData.coverageMin}
                onChange={(e) => setFormData({ ...formData, coverageMin: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-coverageMax">Maximum Coverage (₹) *</Label>
              <Input
                id="edit-coverageMax"
                type="number"
                required
                value={formData.coverageMax}
                onChange={(e) => setFormData({ ...formData, coverageMax: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#37322F] hover:bg-[#2a2521]">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
