'use client'

import { useEffect, useState } from 'react'
import { Shield, FileText, Download, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CompliancePage() {
  const [loading, setLoading] = useState(true)
  const [auditLogs, setAuditLogs] = useState([])

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  async function fetchAuditLogs() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/audit-logs')
      if (res.ok) {
        const data = await res.json()
        setAuditLogs(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date) {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const actionColors = {
    create: 'bg-green-50 text-green-700 border-green-200',
    update: 'bg-blue-50 text-blue-700 border-blue-200',
    delete: 'bg-red-50 text-red-700 border-red-200',
    approve: 'bg-green-50 text-green-700 border-green-200',
    reject: 'bg-red-50 text-red-700 border-red-200',
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#37322F] mb-2">Compliance & Audit</h1>
          <p className="text-gray-600">Monitor regulatory compliance, audit trails, and system logs</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Checklist</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Audit Trail */}
        <TabsContent value="audit">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>System Audit Trail</CardTitle>
              <CardDescription>Complete activity log of all user actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p>No audit logs available yet</p>
                  <p className="text-sm text-gray-400 mt-2">Activity logs will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">{formatDate(log.timestamp)}</TableCell>
                          <TableCell className="font-medium">{log.user || 'System'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={actionColors[log.action] || 'bg-gray-50'}>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{log.entity}</TableCell>
                          <TableCell className="text-sm text-gray-600">{log.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Checklist */}
        <TabsContent value="compliance">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Regulatory Compliance Checklist</CardTitle>
              <CardDescription>Track compliance requirements and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { item: 'IRDAI Registration', status: 'completed', dueDate: 'Dec 2024' },
                  { item: 'Annual Financial Audit', status: 'in-progress', dueDate: 'Mar 2025' },
                  { item: 'Data Protection Compliance', status: 'completed', dueDate: 'Jan 2025' },
                  { item: 'Insurance Policy Templates Review', status: 'pending', dueDate: 'Feb 2025' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {item.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.item}</p>
                        <p className="text-xs text-gray-500">Due: {item.dueDate}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        item.status === 'completed'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : item.status === 'in-progress'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }
                    >
                      {item.status.replace('-', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Compliance Documents</CardTitle>
              <CardDescription>Policy templates, licenses, and regulatory documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16 text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p>Document repository coming soon</p>
                <Button variant="outline" className="mt-4" disabled>
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
