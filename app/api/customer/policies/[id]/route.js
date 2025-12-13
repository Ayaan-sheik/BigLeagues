import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDb } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    const { id } = params
    
    const policy = await db.collection('policies').findOne({ 
      id,
      userId: session.user.id 
    })

    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 })
    }

    // Get related transactions
    const transactions = await db.collection('transactions')
      .find({ policyId: id })
      .sort({ date: -1 })
      .limit(10)
      .toArray()

    return NextResponse.json({ policy, transactions })
  } catch (error) {
    console.error('Get policy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch policy' },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    const { id } = params
    const body = await request.json()
    
    // Check if policy exists and belongs to user
    const existingPolicy = await db.collection('policies').findOne({ 
      id,
      userId: session.user.id 
    })

    if (!existingPolicy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 })
    }

    // Customer can only request amendments, not directly edit
    if (body.action === 'request_amendment') {
      // Create an amendment request
      await db.collection('policy_amendments').insertOne({
        id: require('uuid').v4(),
        policyId: id,
        userId: session.user.id,
        requestedChanges: body.changes,
        reason: body.reason,
        status: 'pending',
        createdAt: new Date(),
      })

      return NextResponse.json({ success: true, message: 'Amendment request submitted' })
    }

    if (body.action === 'request_cancellation') {
      // Create a cancellation request
      await db.collection('policy_cancellations').insertOne({
        id: require('uuid').v4(),
        policyId: id,
        userId: session.user.id,
        reason: body.reason,
        status: 'pending',
        createdAt: new Date(),
      })

      return NextResponse.json({ success: true, message: 'Cancellation request submitted' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Update policy error:', error)
    return NextResponse.json(
      { error: 'Failed to update policy' },
      { status: 500 }
    )
  }
}
