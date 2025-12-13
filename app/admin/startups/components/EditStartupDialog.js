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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export default function EditStartupDialog({ startup, onSuccess, trigger }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    founderName: '',
    founderEmail: '',
    teamSize: '',
    fundingStage: '',
    revenue: '',
    status: '',
  })

  const industries = [
    'Hardware & IoT',
    'D2C Electronics',
    'SaaS',
    'Logistics',
    'E-commerce',
    'FinTech',
    'HealthTech',
    'EdTech',
  ]

  const fundingStages = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+']
  const statuses = ['active', 'lead', 'kyc', 'underwriting', 'suspended']

  useEffect(() => {
    if (startup && open) {
      setFormData({
        name: startup.name || '',
        industry: startup.industry || '',
        founderName: startup.founderName || '',
        founderEmail: startup.founderEmail || '',
        teamSize: startup.teamSize?.toString() || '',
        fundingStage: startup.fundingStage || '',
        revenue: startup.revenue?.toString() || '',
        status: startup.status || 'active',
      })
    }
  }, [startup, open])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/startups/${startup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teamSize: parseInt(formData.teamSize) || 0,
          revenue: parseInt(formData.revenue) || 0,
        }),
      })

      if (!res.ok) throw new Error('Failed to update startup')

      toast({
        title: 'Success',
        description: 'Startup updated successfully',
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
          <DialogTitle>Edit Startup</DialogTitle>
          <DialogDescription>Update the startup information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Company Name *</Label>
              <Input
                id="edit-name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-industry">Industry *</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData({ ...formData, industry: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-founderName">Founder Name *</Label>
              <Input
                id="edit-founderName"
                required
                value={formData.founderName}
                onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-founderEmail">Founder Email *</Label>
              <Input
                id="edit-founderEmail"
                type="email"
                required
                value={formData.founderEmail}
                onChange={(e) => setFormData({ ...formData, founderEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-teamSize">Team Size</Label>
              <Input
                id="edit-teamSize"
                type="number"
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fundingStage">Funding Stage</Label>
              <Select
                value={formData.fundingStage}
                onValueChange={(value) => setFormData({ ...formData, fundingStage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fundingStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-revenue">Annual Revenue (₹)</Label>
              <Input
                id="edit-revenue"
                type="number"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
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
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
