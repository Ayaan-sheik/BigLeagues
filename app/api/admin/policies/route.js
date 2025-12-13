import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
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
    
    const query = userId ? { userId } : {}
    
    const policies = await db.collection('policies')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ policies })
  } catch (error) {
    console.error('Get policies error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const db = await getDb()

    // Get user details
    const user = await db.collection('users').findOne({ id: body.userId })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get startup profile
    const profile = await db.collection('startup_profiles').findOne({ userId: body.userId })

    const policy = {
      id: uuidv4(),
      policyNumber: `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId: body.userId,
      startupName: profile?.companyName || user.name,
      productName: body.productName,
      coverageAmount: parseFloat(body.coverageAmount),
      premiumAmount: parseFloat(body.premiumAmount || 0),
      premiumType: body.premiumType || 'per-transaction',
      deductible: parseFloat(body.deductible || 0),
      coverageDetails: body.coverageDetails || {},
      exclusions: body.exclusions || [],
      startDate: body.startDate || new Date(),
      endDate: body.endDate,
      status: body.status || 'active',
      totalPremiumCollected: 0,
      transactionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user.id,
    }

    await db.collection('policies').insertOne(policy)

    // Create notification for customer
    await db.collection('notifications').insertOne({
      id: uuidv4(),
      type: 'policy_activated',
      title: 'New Policy Activated',
      message: `Your ${policy.productName} policy is now active`,
      entityType: 'policy',
      entityId: policy.id,
      userId: body.userId,
      read: false,
      createdAt: new Date(),
    })

    return NextResponse.json({ policy }, { status: 201 })
  } catch (error) {
    console.error('Create policy error:', error)
    return NextResponse.json(
      { error: 'Failed to create policy' },
      { status: 500 }
    )
  }
}
