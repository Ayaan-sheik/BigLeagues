import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDb } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    
    // Fetch policies for this user
    const policies = await db.collection('policies')
      .find({ userId: session.user.id })
      .toArray()
    
    // Fetch applications (which represent policies)
    const applications = await db.collection('applications')
      .find({ userId: session.user.id })
      .toArray()
    
    // Fetch payments (new payment tracking)
    const payments = await db.collection('customer_payments')
      .find({ userId: session.user.id })
      .sort({ created_at: -1 })
      .limit(5)
      .toArray()
    
    // Fetch transactions (legacy)
    const transactions = await db.collection('transactions')
      .find({ userId: session.user.id })
      .sort({ date: -1 })
      .limit(5)
      .toArray()
    
    // Fetch claims
    const claims = await db.collection('claims')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()
    
    // Calculate stats
    const totalCoverage = applications
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + (p.coverageAmount || p.requestedCoverage || 0), 0)
    
    const activePolicies = applications.filter(p => p.status === 'approved').length
    
    // Calculate MTD premium from payments
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const premiumPaidMTD = payments
      .filter(p => new Date(p.created_at) >= startOfMonth)
      .reduce((sum, p) => sum + (p.premium_amount || 0), 0)
    
    // Calculate total revenue from payments
    const totalRevenue = payments.reduce((sum, p) => sum + (p.total_amount || 0), 0)
    
    // Get startup profile for risk score
    const profile = await db.collection('startup_profiles')
      .findOne({ userId: session.user.id })
    
    const stats = {
      totalCoverage,
      premiumPaidMTD,
      activePolicies,
      riskScore: profile?.riskScore || 'A',
      recentTransactions: transactions.map(t => ({
        id: t.id,
        productSold: t.productSold || 'Product',
        saleAmount: t.saleAmount || 0,
        premiumAmount: t.premiumAmount || 0,
        date: t.date
      })),
      recentClaims: claims.map(c => ({
        id: c.id,
        claimType: c.claimType || 'General Claim',
        status: c.status,
        date: c.createdAt
      }))
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
