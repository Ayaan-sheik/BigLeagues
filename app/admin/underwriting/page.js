'use client'

import { useEffect, useState } from 'react'
import { ClipboardCheck, Plus, Eye, Check, X, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import ApplicationDetailDialog from './components/ApplicationDetailDialog'

export default function UnderwritingPage() {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/applications')
      if (!res.ok) throw new Error('Failed to fetch applications')
      const data = await res.json()
      setApplications(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { id: 'new', title: 'New Applications', color: 'blue' },
    { id: 'under_review', title: 'Under Review', color: 'yellow' },
    { id: 'additional_info_required', title: 'Info Required', color: 'orange' },
    { id: 'approved', title: 'Approved', color: 'green' },
    { id: 'rejected', title: 'Rejected', color: 'red' },
  ]

  function getApplicationsByStatus(status) {
    return applications.filter((app) => app.status === status)
  }

  function getRiskScoreColor(score) {
    if (!score) return 'bg-gray-50 text-gray-700 border-gray-200'
    if (score < 30) return 'bg-green-50 text-green-700 border-green-200'
    if (score < 50) return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#37322F] mb-2">Underwriting Workflow</h1>
          <p className="text-gray-600">Review and approve startup applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <MessageCircle className="h-4 w-4 mr-2" />
            Risk Rules
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#37322F]">{applications.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total Applications</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {getApplicationsByStatus('new').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">New</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {getApplicationsByStatus('under_review').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">In Review</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {getApplicationsByStatus('approved').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Approved</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {getApplicationsByStatus('rejected').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
        {columns.map((column) => {
          const columnApps = getApplicationsByStatus(column.id)
          return (
            <Card key={column.id} className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{column.title}</span>
                  <Badge variant="outline" className="ml-2">
                    {columnApps.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2 px-2">
                    {columnApps.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">No applications</div>
                    ) : (
                      columnApps.map((app) => (
                        <Card
                          key={app.id}
                          className="border hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                                  {app.companyName}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{app.industry}</p>
                              </div>
                              <ApplicationDetailDialog application={app} onSuccess={fetchApplications} />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Coverage:</span>
                              <span className="text-xs font-medium">
                                ₹{(app.coverageAmount / 100000).toFixed(1)}L
                              </span>
                            </div>

                            {app.riskScore !== null && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">Risk:</span>
                                <Badge variant="outline" className={getRiskScoreColor(app.riskScore)}>
                                  {app.riskScore}
                                </Badge>
                              </div>
                            )}

                            <div className="text-xs text-gray-400 pt-1 border-t">
                              {app.applicationNumber}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
