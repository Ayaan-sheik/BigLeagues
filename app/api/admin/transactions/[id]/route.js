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
    
    const transaction = await db.collection('transactions').findOne({ id })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Get policy details if exists
    let policy = null
    if (transaction.policyId) {
      policy = await db.collection('policies').findOne({ id: transaction.policyId })
    }

    return NextResponse.json({ transaction, policy })
  } catch (error) {
    console.error('Get transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
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
    
    const existingTransaction = await db.collection('transactions').findOne({ id })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Update transaction (usually settlement status)
    const result = await db.collection('transactions').updateOne(
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
      return NextResponse.json({ error: 'Failed to update transaction' }, { status: 404 })
    }

    const updatedTransaction = await db.collection('transactions').findOne({ id })

    // Create notification for customer if settlement status changed
    if (body.settlementStatus && body.settlementStatus !== existingTransaction.settlementStatus) {
      await db.collection('notifications').insertOne({
        id: uuidv4(),
        type: 'settlement_updated',
        title: 'Premium Settlement Updated',
        message: `Transaction ${existingTransaction.transactionId} settlement status: ${body.settlementStatus}`,
        entityType: 'transaction',
        entityId: id,
        userId: existingTransaction.userId,
        read: false,
        createdAt: new Date(),
      })
    }

    return NextResponse.json({ transaction: updatedTransaction })
  } catch (error) {
    console.error('Update transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}
