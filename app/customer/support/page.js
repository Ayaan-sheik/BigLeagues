'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LifeBuoy, MessageSquare } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support</h1>
        <p className="text-gray-600 mt-1">Get help with your insurance queries</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Support Ticket</CardTitle>
          <CardDescription>We'll get back to you within 24 hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Brief description of your issue" />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <select id="category" className="w-full border rounded-lg px-3 py-2">
              <option>Billing</option>
              <option>Claim</option>
              <option>Technical</option>
              <option>General</option>
            </select>
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={5} placeholder="Describe your issue in detail" />
          </div>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            Submit Ticket
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past Tickets</CardTitle>
          <CardDescription>Your support history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <LifeBuoy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No support tickets yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
