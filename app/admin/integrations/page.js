'use client'

import { useEffect, useState } from 'react'
import { Plug, CheckCircle, XCircle, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  const integrations = [
    {
      name: 'Dodo Payments',
      description: 'Payment gateway for premium collection and split settlements',
      status: !!(settings?.dodoApiKey && settings?.dodoSecretKey),
      icon: Plug,
      color: 'blue',
    },
    {
      name: 'Email Service',
      description: 'SendGrid for notifications and alerts',
      status: !!settings?.emailApiKey,
      icon: Activity,
      color: 'green',
    },
    {
      name: 'KYC Provider',
      description: 'Document verification and KYC checks',
      status: false,
      icon: CheckCircle,
      color: 'purple',
    },
    {
      name: 'SMS Service',
      description: 'Twilio for SMS notifications',
      status: false,
      icon: Activity,
      color: 'orange',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#37322F] mb-2">Integration Management</h1>
        <p className="text-gray-600">Manage external services, APIs, and webhook configurations</p>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.name} className="border-gray-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${integration.color}-50`}>
                    <integration.icon className={`h-5 w-5 text-${integration.color}-600`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <CardDescription className="mt-1">{integration.description}</CardDescription>
                  </div>
                </div>
                {integration.status ? (
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Enable Integration</span>
                <Switch checked={integration.status} disabled />
              </div>
              {integration.name === 'Dodo Payments' && (
                <div className="mt-3 pt-3 border-t">
                  <a
                    href="/admin/settings"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Configure in Settings →
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Webhooks Section */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>Manage incoming and outgoing webhooks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Plug className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>Webhook management interface coming soon</p>
            <Button variant="outline" className="mt-4" disabled>
              Add Webhook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
