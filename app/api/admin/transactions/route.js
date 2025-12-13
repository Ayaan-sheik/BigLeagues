import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDb } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const policyId = searchParams.get('policyId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    let query = {}
    if (userId) query.userId = userId
    if (policyId) query.policyId = policyId
    if (status) query.settlementStatus = status
    
    const transactions = await db.collection('transactions')
      .find(query)
      .sort({ date: -1 })
      .limit(limit)
      .toArray()

    // Calculate summary stats
    const totalPremium = transactions.reduce((sum, t) => sum + (t.premiumAmount || 0), 0)
    const totalSales = transactions.reduce((sum, t) => sum + (t.saleAmount || 0), 0)

    return NextResponse.json({ 
      transactions,
      summary: {
        count: transactions.length,
        totalPremium,
        totalSales
      }
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
