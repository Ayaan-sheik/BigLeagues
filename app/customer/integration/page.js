'use client'

import { useEffect, useState } from 'react'
import { Plug, Key, Copy, RefreshCw, AlertCircle, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function IntegrationPage() {
  const [integration, setIntegration] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')

  useEffect(() => {
    fetchIntegration()
  }, [])

  async function fetchIntegration() {
    try {
      setLoading(true)
      const res = await fetch('/api/customer/integration')
      if (!res.ok) throw new Error('Failed to fetch integration')
      const data = await res.json()
      setIntegration(data)
      setWebhookUrl(data.webhookUrl || '')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function generateApiKey() {
    if (!confirm('Are you sure you want to generate a new API key? The old key will be invalidated.')) {
      return
    }
    
    try {
      const res = await fetch('/api/customer/integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_key' }),
      })
      if (!res.ok) throw new Error('Failed to generate API key')
      await fetchIntegration()
      alert('New API key generated successfully!')
    } catch (err) {
      alert(err.message)
    }
  }

  async function updateWebhook() {
    try {
      const res = await fetch('/api/customer/integration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl }),
      })
      if (!res.ok) throw new Error('Failed to update webhook')
      alert('Webhook URL updated successfully!')
    } catch (err) {
      alert(err.message)
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Integration</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integration & API</h1>
        <p className="text-gray-600 mt-1">Manage your API keys and webhooks</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key
          </CardTitle>
          <CardDescription>
            Use this key to integrate InsureInfra with your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Your API Key</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={integration?.apiKey || 'No API key generated'}
                readOnly
                type="password"
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(integration?.apiKey)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Keep this key secure. Never share it publicly or commit it to version control.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateApiKey} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate New Key
            </Button>
            <Badge variant={integration?.environment === 'live' ? 'success' : 'secondary'}>
              {integration?.environment || 'sandbox'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Webhooks
          </CardTitle>
          <CardDescription>
            Receive real-time notifications about claims, payments, and policy updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Webhook URL</Label>
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-domain.com/webhooks/insureinfra"
              className="mt-2"
            />
          </div>

          <Button onClick={updateWebhook}>
            Save Webhook URL
          </Button>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Webhook Events</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <code className="bg-blue-100 px-1 rounded">claim.updated</code> - When a claim status changes</li>
              <li>• <code className="bg-blue-100 px-1 rounded">policy.activated</code> - When a policy becomes active</li>
              <li>• <code className="bg-blue-100 px-1 rounded">payment.received</code> - When a premium payment is processed</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
          <CardDescription>Learn how to integrate with InsureInfra API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Quick Start</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// Record a transaction with premium
fetch('https://api.insureinfra.com/v1/transactions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    productSold: 'Product Name',
    saleAmount: 10000,
    premiumAmount: 15,
    transactionId: 'your-unique-id'
  })
})`}
              </pre>
            </div>
            <Button variant="outline" asChild>
              <a href="#" target="_blank">
                View Full Documentation
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
