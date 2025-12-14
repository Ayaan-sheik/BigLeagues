'use client'

import { useEffect, useState } from 'react'
import { Download, RefreshCw, CheckCircle, XCircle, Shield, DollarSign, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    total_revenue: 0,
    total_base: 0,
    total_premium: 0,
    total_payments: 0,
    with_insurance: 0,
    without_insurance: 0
  })
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/customer/payments')
      const data = await response.json()
      setPayments(data.payments || [])
      setSummary(data.summary || {})
    } catch (error) {
      console.error('Error fetching payments:', error)
    }
    setLoading(false)
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Payment ID', 'Order ID', 'Service', 'Base Amount', 'Premium', 'Total', 'Customer Email']
    const rows = payments.map(p => [
      new Date(p.created_at).toLocaleDateString(),
      p.payment_id,
      p.order_id,
      p.service_name,
      `₹${p.base_amount}`,
      `₹${p.premium_amount}`,
      `₹${p.total_amount}`,
      p.customer_email || 'N/A'
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const paymentsWithInsurance = payments.filter(p => p.premium_amount > 0)
  const paymentsWithoutInsurance = payments.filter(p => p.premium_amount === 0)

  const filteredPayments = activeTab === 'with-insurance' 
    ? paymentsWithInsurance 
    : activeTab === 'without-insurance' 
    ? paymentsWithoutInsurance 
    : payments

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Tracking</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track all your payments and insurance premiums
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={fetchPayments} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportToCSV} size="sm" disabled={payments.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{summary.total_revenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.total_payments} payment{summary.total_payments !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">With Insurance</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{summary.with_insurance}</div>
            <p className="text-xs text-gray-500 mt-1">
              ₹{summary.total_premium?.toLocaleString() || 0} premium
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Without Insurance</CardTitle>
            <XCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{summary.without_insurance}</div>
            <p className="text-xs text-gray-500 mt-1">Base amount only</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{summary.total_payments > 0 ? Math.round(summary.total_revenue / summary.total_payments).toLocaleString() : 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Per payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('all')}
        >
          All Payments ({payments.length})
        </Button>
        <Button
          variant={activeTab === 'with-insurance' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('with-insurance')}
        >
          <Shield className="h-4 w-4 mr-2" />
          With Insurance ({paymentsWithInsurance.length})
        </Button>
        <Button
          variant={activeTab === 'without-insurance' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('without-insurance')}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Without Insurance ({paymentsWithoutInsurance.length})
        </Button>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            {activeTab === 'all' && 'All your payment transactions'}
            {activeTab === 'with-insurance' && 'Payments with insurance coverage'}
            {activeTab === 'without-insurance' && 'Payments without insurance coverage'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No payments found</p>
              <p className="text-sm text-gray-400">
                Start recording payments using the API to see them here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 pb-3">Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 pb-3">Service</th>
                    <th className="text-left text-xs font-medium text-gray-500 pb-3">Payment ID</th>
                    <th className="text-right text-xs font-medium text-gray-500 pb-3">Base</th>
                    <th className="text-right text-xs font-medium text-gray-500 pb-3">Premium</th>
                    <th className="text-right text-xs font-medium text-gray-500 pb-3">Total</th>
                    <th className="text-left text-xs font-medium text-gray-500 pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPayments.map((payment, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 text-sm text-gray-600">
                        <div>{new Date(payment.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(payment.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="text-sm font-medium text-gray-900">{payment.service_name}</div>
                        <div className="text-xs text-gray-500">{payment.service_id}</div>
                      </td>
                      <td className="py-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                          {payment.payment_id}
                        </code>
                      </td>
                      <td className="py-3 text-right text-sm text-gray-700">
                        ₹{payment.base_amount?.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        {payment.premium_amount > 0 ? (
                          <span className="text-sm font-medium text-green-600">
                            ₹{payment.premium_amount?.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 text-right text-sm font-semibold text-gray-900">
                        ₹{payment.total_amount?.toLocaleString()}
                      </td>
                      <td className="py-3">
                        {payment.premium_amount > 0 ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <Shield className="h-3 w-3 mr-1" />
                            Insured
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            No Insurance
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t bg-gray-50">
                  <tr>
                    <td colSpan="3" className="py-3 text-sm font-medium text-gray-700">TOTAL:</td>
                    <td className="py-3 text-right text-sm font-semibold text-gray-900">
                      ₹{filteredPayments.reduce((sum, p) => sum + (p.base_amount || 0), 0).toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-sm font-semibold text-gray-900">
                      ₹{filteredPayments.reduce((sum, p) => sum + (p.premium_amount || 0), 0).toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-sm font-semibold text-gray-900">
                      ₹{filteredPayments.reduce((sum, p) => sum + (p.total_amount || 0), 0).toLocaleString()}
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
