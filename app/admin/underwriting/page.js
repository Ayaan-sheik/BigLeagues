'use client'

import { useEffect, useState } from 'react'
import { ClipboardCheck, Eye, GripVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import ApplicationDetailDialog from './components/ApplicationDetailDialog'

export default function UnderwritingPage() {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [draggedItem, setDraggedItem] = useState(null)

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

  async function handleDrop(e, targetStatus) {
    e.preventDefault()
    if (!draggedItem || draggedItem.status === targetStatus) return

    try {
      const res = await fetch(`/api/admin/applications/${draggedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      })

      if (res.ok) {
        fetchApplications()
      }
    } catch (err) {
      console.error(err)
    }

    setDraggedItem(null)
  }

  function handleDragStart(e, app) {
    setDraggedItem(app)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
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
          <p className="text-gray-600">Review and approve startup applications - Drag & drop to change status</p>
        </div>
      </div>

      {/* Stats - Aligned with Kanban columns */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
        <Card className="border-gray-200">
          <CardContent className="pt-3 pb-3 px-3">
            <div className="text-lg font-bold text-[#37322F]">{applications.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-3 pb-3 px-3">
            <div className="text-lg font-bold text-blue-600">
              {getApplicationsByStatus('new').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">New</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-3 pb-3 px-3">
            <div className="text-lg font-bold text-yellow-600">
              {getApplicationsByStatus('under_review').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Review</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-3 pb-3 px-3">
            <div className="text-lg font-bold text-green-600">
              {getApplicationsByStatus('approved').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Approved</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-3 pb-3 px-3">
            <div className="text-lg font-bold text-red-600">
              {getApplicationsByStatus('rejected').length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board - Vertical Scrollable */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
        {columns.map((column) => {
          const columnApps = getApplicationsByStatus(column.id)
          return (
            <div
              key={column.id}
              onDrop={(e) => handleDrop(e, column.id)}
              onDragOver={handleDragOver}
              className="h-full"
            >
              <Card className="border-gray-200 h-full">
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
                          <div
                            key={app.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, app)}
                            className="cursor-move"
                          >
                            <Card className="border hover:shadow-md transition-shadow">
                              <CardContent className="p-3 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 break-words line-clamp-2">
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

                                {app.productPrice && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">Product Price:</span>
                                    <span className="text-xs font-medium text-purple-600">₹{app.productPrice.toLocaleString()}</span>
                                  </div>
                                )}

                                {app.riskScore !== null && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">Risk:</span>
                                    <Badge variant="outline" className={getRiskScoreColor(app.riskScore)}>
                                      {app.riskScore}
                                    </Badge>
                                  </div>
                                )}

                                {app.recommendedPremium && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">Rec. Premium:</span>
                                    <span className="text-xs font-semibold text-blue-600">₹{app.recommendedPremium}</span>
                                    {app.productPrice && (
                                      <span className="text-xs text-gray-400">
                                        ({((app.recommendedPremium / app.productPrice) * 100).toFixed(1)}%)
                                      </span>
                                    )}
                                  </div>
                                )}

                                {app.actualPremium && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">Premium:</span>
                                    <span className="text-xs font-bold text-green-600">₹{app.actualPremium}</span>
                                    {app.productPrice && (
                                      <span className="text-xs text-gray-400">
                                        ({((app.actualPremium / app.productPrice) * 100).toFixed(1)}%)
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div className="text-xs text-gray-400 pt-1 border-t truncate">
                                  {app.applicationNumber}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
