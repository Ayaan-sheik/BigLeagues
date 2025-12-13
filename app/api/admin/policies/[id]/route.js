import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    const { id } = params
    
    const policy = await db.collection('policies').findOne({ id })

    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 })
    }

    // Get related transactions
    const transactions = await db.collection('transactions')
      .find({ policyId: id })
      .sort({ date: -1 })
      .toArray()

    // Get related claims
    const claims = await db.collection('claims')
      .find({ policyId: id })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ policy, transactions, claims })
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
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    const { id } = params
    const body = await request.json()
    
    const existingPolicy = await db.collection('policies').findOne({ id })

    if (!existingPolicy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 })
    }

    // Update policy
    const result = await db.collection('policies').updateOne(
      { id },
      { 
        $set: { 
          ...body,
          updatedAt: new Date(),
          updatedBy: session.user.id,
        } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Failed to update policy' }, { status: 404 })
    }

    const updatedPolicy = await db.collection('policies').findOne({ id })

    // Create notification for customer if status changed
    if (body.status && body.status !== existingPolicy.status) {
      await db.collection('notifications').insertOne({
        id: uuidv4(),
        type: 'policy_updated',
        title: 'Policy Status Updated',
        message: `Your policy status has been updated to: ${body.status}`,
        entityType: 'policy',
        entityId: id,
        userId: existingPolicy.userId,
        read: false,
        createdAt: new Date(),
      })
    }

    return NextResponse.json({ policy: updatedPolicy })
  } catch (error) {
    console.error('Update policy error:', error)
    return NextResponse.json(
      { error: 'Failed to update policy' },
      { status: 500 }
    )
  }
}
