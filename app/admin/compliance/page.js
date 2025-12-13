'use client'

import { useEffect, useState } from 'react'
import { Shield, FileText, Download, AlertTriangle, User, Activity, TrendingUp } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function CompliancePage() {
  const [loading, setLoading] = useState(true)
  const [auditLogs, setAuditLogs] = useState([])
  const [auditAnalytics, setAuditAnalytics] = useState(null)
  const [checklists, setChecklists] = useState([])
  const [reports, setReports] = useState([])
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    fetchAllData()
  }, [timeRange])

  async function fetchAllData() {
    try {
      setLoading(true)
      const [logsRes, analyticsRes, checklistsRes, reportsRes] = await Promise.all([
        fetch('/api/admin/audit-logs'),
        fetch(`/api/admin/audit-analytics?days=${timeRange}`),
        fetch('/api/admin/compliance/checklists'),
        fetch('/api/admin/compliance/reports'),
      ])

      if (logsRes.ok) setAuditLogs(await logsRes.json())
      if (analyticsRes.ok) setAuditAnalytics(await analyticsRes.json())
      if (checklistsRes.ok) setChecklists(await checklistsRes.json())
      if (reportsRes.ok) setReports(await reportsRes.json())
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
    login: 'bg-purple-50 text-purple-700 border-purple-200',
    security_alert: 'bg-red-100 text-red-800 border-red-300',
  }

  const severityColors = {
    low: 'bg-gray-50 text-gray-700 border-gray-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-300',
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
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
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-[#37322F]">{auditAnalytics?.totalEvents || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Total Events</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{auditAnalytics?.uniqueUsers || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Active Users</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{auditAnalytics?.criticalEvents || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Critical Events</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{auditAnalytics?.avgResponseTime || 0}ms</div>
            <p className="text-xs text-gray-500 mt-1">Avg Response Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">IRDAI Reports</TabsTrigger>
          <TabsTrigger value="checklist">Compliance Checklist</TabsTrigger>
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
                  <p className="text-sm text-gray-400 mt-2">Activity logs will appear as you use the system</p>
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
                        <TableHead>Method</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.slice(0, 50).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs font-mono">{formatDate(log.timestamp)}</TableCell>
                          <TableCell className="text-sm">{log.user || 'System'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={actionColors[log.action] || 'bg-gray-50'}>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{log.entityType}</TableCell>
                          <TableCell className="text-xs font-mono">{log.method}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={severityColors[log.severity] || 'bg-gray-50'}>
                              {log.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                log.status >= 200 && log.status < 300
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-red-50 text-red-700'
                              }
                            >
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-gray-600 max-w-xs truncate">
                            {log.endpoint || log.details}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="space-y-4">
            {/* Activity Timeline Chart */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Daily activity volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={auditAnalytics?.dailyVolume || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Active Users & Critical Events */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>Top Active Users</CardTitle>
                  <CardDescription>Users by activity count</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(auditAnalytics?.topUsers || []).map((user, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                            {idx + 1}
                          </div>
                          <span className="text-sm font-medium">{user.user || 'System'}</span>
                        </div>
                        <Badge variant="outline">{user.count} actions</Badge>
                      </div>
                    ))}
                    {(!auditAnalytics?.topUsers || auditAnalytics.topUsers.length === 0) && (
                      <p className="text-center text-gray-500 py-4">No user activity yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>Critical Events</CardTitle>
                  <CardDescription>High-priority security alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(auditAnalytics?.criticalEvents || []).map((event) => (
                      <div key={event.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-900">{event.action}</p>
                            <p className="text-xs text-red-700 mt-1">{event.details}</p>
                            <p className="text-xs text-red-600 mt-1">{formatDate(event.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!auditAnalytics?.criticalEvents || auditAnalytics.criticalEvents.length === 0) && (
                      <p className="text-center text-gray-500 py-4">No critical events</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* IRDAI Reports */}
        <TabsContent value="compliance">
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>IRDAI Regulatory Reports</CardTitle>
                  <CardDescription>Generated compliance reports for regulatory submission</CardDescription>
                </div>
                <Button className="bg-[#37322F] hover:bg-[#2a2521]">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p>No reports generated yet</p>
                  <p className="text-sm text-gray-400 mt-2">Click "Generate Report" to create your first IRDAI compliance report</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{report.reportType}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Period: {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                        </p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-xs text-gray-600">Loss Ratio: <strong>{report.lossRatio}%</strong></span>
                          <span className="text-xs text-gray-600">Solvency: <strong>{report.solvencyRatio}%</strong></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            report.status === 'submitted'
                              ? 'bg-green-50 text-green-700'
                              : report.status === 'approved'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-gray-50 text-gray-700'
                          }
                        >
                          {report.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Checklist */}
        <TabsContent value="checklist">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Regulatory Compliance Checklist</CardTitle>
              <CardDescription>Track compliance requirements and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checklists.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {item.completionStatus === 'completed' ? (
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-green-600" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-gray-200" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">Due: {formatDate(item.dueDate)}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        item.completionStatus === 'completed'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : item.completionStatus === 'in-progress'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : new Date(item.dueDate) < new Date()
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }
                    >
                      {item.completionStatus === 'pending' && new Date(item.dueDate) < new Date()
                        ? 'overdue'
                        : item.completionStatus.replace('-', ' ')}
                    </Badge>
                  </div>
                ))}
                {checklists.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No compliance items yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
