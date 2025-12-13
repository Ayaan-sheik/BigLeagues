'use client'

import { useEffect, useState } from 'react'
import { Save, AlertCircle, CheckCircle2, Key, Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      const data = await res.json()
      setSettings(data)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!res.ok) throw new Error('Failed to save settings')

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#37322F] mb-2">Settings</h1>
        <p className="text-gray-600">Manage your platform configuration and integrations</p>
      </div>

      {/* Company Settings */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Basic information about your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings?.companyName || ''}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyEmail">Company Email</Label>
              <Input
                id="companyEmail"
                type="email"
                value={settings?.companyEmail || ''}
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Integration - Dodo */}
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Dodo Payment Integration
              </CardTitle>
              <CardDescription>Configure your Dodo payment gateway credentials</CardDescription>
            </div>
            {!settings?.dodoApiKey && (
              <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-lg text-sm border border-orange-200">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Not Configured</span>
              </div>
            )}
            {settings?.dodoApiKey && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg text-sm border border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Active</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">Important</p>
                <p className="text-sm text-orange-700 mt-1">
                  Premium collection features will display an error if Dodo API keys are not configured. Please add
                  your Dodo credentials below to enable payment processing.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dodoApiKey">Dodo API Key</Label>
            <Input
              id="dodoApiKey"
              type="password"
              placeholder="Enter your Dodo API key"
              value={settings?.dodoApiKey || ''}
              onChange={(e) => setSettings({ ...settings, dodoApiKey: e.target.value })}
            />
            <p className="text-xs text-gray-500">Your API key for authenticating with Dodo payment gateway</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dodoSecretKey">Dodo Secret Key</Label>
            <Input
              id="dodoSecretKey"
              type="password"
              placeholder="Enter your Dodo secret key"
              value={settings?.dodoSecretKey || ''}
              onChange={(e) => setSettings({ ...settings, dodoSecretKey: e.target.value })}
            />
            <p className="text-xs text-gray-500">Your secret key for secure payment processing</p>
          </div>

          <div className="pt-2">
            <a
              href="https://dodo.payments/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Need help finding your Dodo API keys? View documentation →
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>Configure email service for notifications and alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emailProvider">Email Provider</Label>
              <Input
                id="emailProvider"
                value={settings?.emailProvider || 'sendgrid'}
                onChange={(e) => setSettings({ ...settings, emailProvider: e.target.value })}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailApiKey">Email API Key</Label>
              <Input
                id="emailApiKey"
                type="password"
                placeholder="Enter your email API key"
                value={settings?.emailApiKey || ''}
                onChange={(e) => setSettings({ ...settings, emailApiKey: e.target.value })}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-xs text-gray-500">Send email alerts for important events</p>
            </div>
            <Switch
              checked={settings?.notificationsEnabled || false}
              onCheckedChange={(checked) => setSettings({ ...settings, notificationsEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="bg-[#37322F] hover:bg-[#2a2521]"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
