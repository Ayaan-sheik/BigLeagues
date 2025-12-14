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
            Use this key to integrate Vantage with your application
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
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>Learn how to integrate with Vantage API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Get Premium Information */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg">Get Premium Information</h4>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  GET
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Endpoint</Label>
                  <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">
                    GET {typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/premium
                  </code>
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Add ?serviceId=XXX or ?premium=XXX to filter
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Authentication</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Include your API key in the Authorization header
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Example Request</Label>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mt-2">
{`// JavaScript/Node.js
const response = await fetch('${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/premium', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const data = await response.json();
console.log(data);`}
                  </pre>
                </div>

                <div>
                  <Label className="text-sm font-medium">Example Response</Label>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mt-2">
{`{
  "success": true,
  "data": {
    "companyName": "Your Company Name",
    "policies": [
      {
        "serviceId": "APP-2024-001",
        "productName": "Product Liability Insurance",
        "productId": "uuid",
        "companyName": "Your Company",
        "coverageAmount": 10000000,
        "premium": {
          "recommended": 750,
          "actual": 800,
          "currency": "INR"
        },
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "summary": {
      "totalPolicies": 1,
      "totalPremium": 800,
      "currency": "INR"
    }
  }
}`}
                  </pre>
                </div>

                <div>
                  <Label className="text-sm font-medium">Filtering Examples</Label>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mt-2">
{`// Filter by Service ID
GET /api/v1/premium?serviceId=APP-2024-001

// Filter by Premium Amount
GET /api/v1/premium?premium=800

// Combine filters
GET /api/v1/premium?serviceId=APP-2024-001&premium=800`}
                  </pre>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="text-sm font-semibold text-blue-900 mb-1">Notes:</h5>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Only returns approved policies</li>
                    <li>• Premium amounts are in INR</li>
                    <li>• "serviceId" is your unique policy identifier</li>
                    <li>• Use query parameters to filter results</li>
                    <li>• API key must be kept secure</li>
                    <li>• Rate limit: 100 requests per minute</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* cURL Example */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-2">cURL Example</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X GET '${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/premium' \\
  -H 'Authorization: Bearer YOUR_API_KEY'`}
              </pre>
            </div>

            {/* Python Example */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Python Example</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import requests

url = '${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/premium'
headers = {
    'Authorization': 'Bearer YOUR_API_KEY'
}

response = requests.get(url, headers=headers)
data = response.json()

print(f"Total Premium: ₹{data['data']['summary']['totalPremium']}")
print(f"Total Policies: {data['data']['summary']['totalPolicies']}")`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Tracking API */}
      <Card>
        <CardHeader>
          <CardTitle>Record Payment Transactions</CardTitle>
          <CardDescription>Track payments with insurance premiums in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Post Payment */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg">Record a Payment</h4>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  POST
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Endpoint</Label>
                  <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">
                    POST {typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/payments
                  </code>
                </div>

                <div>
                  <Label className="text-sm font-medium">Request Body</Label>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mt-2">
{`{
  "payment_id": "pay_123456789",
  "order_id": "order_123456",
  "service_name": "Premium Subscription",
  "service_id": "service_001",
  "base_amount": 1000,
  "premium_amount": 50,
  "total_amount": 1050,
  "insurer_name": "Vantage",
  "customer_email": "customer@example.com",
  "customer_phone": "+919876543210"
}`}
                  </pre>
                </div>

                <div>
                  <Label className="text-sm font-medium">Example Request (JavaScript)</Label>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mt-2">
{`const response = await fetch('${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/payments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    payment_id: 'pay_' + Date.now(),
    order_id: 'order_' + Date.now(),
    service_name: 'Product Purchase',
    base_amount: 1000,
    premium_amount: 50,
    total_amount: 1050,
    customer_email: 'customer@example.com'
  })
});

const data = await response.json();
console.log(data);`}
                  </pre>
                </div>

                <div>
                  <Label className="text-sm font-medium">Example Response</Label>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mt-2">
{`{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "payment_id": "pay_123456789",
    "order_id": "order_123456",
    "service_name": "Premium Subscription",
    "total_amount": 1050,
    "premium_amount": 50,
    "created_at": "2024-12-14T10:30:00.000Z"
  }
}`}
                  </pre>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="text-sm font-semibold text-blue-900 mb-1">Field Descriptions:</h5>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• <strong>payment_id</strong>: Unique payment identifier (required)</li>
                    <li>• <strong>service_name</strong>: Name of the service/product (required)</li>
                    <li>• <strong>total_amount</strong>: Total transaction amount (required)</li>
                    <li>• <strong>base_amount</strong>: Base price without insurance</li>
                    <li>• <strong>premium_amount</strong>: Insurance premium amount</li>
                    <li>• <strong>order_id</strong>: Your order reference ID</li>
                    <li>• <strong>service_id</strong>: Service/product identifier</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Python Example */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-2">Python Example</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import requests

url = '${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/payments'
headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}
payload = {
    'payment_id': 'pay_123456',
    'service_name': 'Premium Plan',
    'base_amount': 1000,
    'premium_amount': 50,
    'total_amount': 1050,
    'customer_email': 'customer@example.com'
}

response = requests.post(url, headers=headers, json=payload)
result = response.json()

if result['success']:
    print(f"Payment recorded: {result['data']['payment_id']}")
else:
    print(f"Error: {result['message']}")`}
              </pre>
            </div>

            {/* View Payments */}
            <div className="p-4 border rounded-lg bg-green-50">
              <h4 className="font-semibold text-green-900 mb-2">View Your Payment History</h4>
              <p className="text-sm text-green-700 mb-3">
                All recorded payments are available in your <strong>Payment Tracking</strong> page with detailed analytics and export options.
              </p>
              <a 
                href="/customer/payments" 
                className="inline-flex items-center text-sm font-medium text-green-700 hover:text-green-900 underline"
              >
                Go to Payment Tracking →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
