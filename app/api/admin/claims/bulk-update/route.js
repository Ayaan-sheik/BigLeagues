import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { claimIds, updates } = body

    if (!claimIds || !Array.isArray(claimIds) || claimIds.length === 0) {
      return NextResponse.json(
        { error: 'claimIds array is required' },
        { status: 400 }
      )
    }

    const db = await getDb()

    // Update all claims
    const result = await db.collection('claims').updateMany(
      { id: { $in: claimIds } },
      { 
        $set: { 
          ...updates,
          updatedAt: new Date(),
          updatedBy: session.user.id,
        } 
      }
    )

    // Get updated claims for notifications
    const updatedClaims = await db.collection('claims')
      .find({ id: { $in: claimIds } })
      .toArray()

    // Create notifications for all affected customers
    const notifications = updatedClaims.map(claim => ({
      id: uuidv4(),
      type: 'claim_updated',
      title: 'Claim Status Updated',
      message: `Your claim ${claim.claimNumber} has been updated`,
      entityType: 'claim',
      entityId: claim.id,
      userId: claim.userId,
      read: false,
      createdAt: new Date(),
    }))

    if (notifications.length > 0) {
      await db.collection('notifications').insertMany(notifications)
    }

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      claims: updatedClaims
    })
  } catch (error) {
    console.error('Bulk update claims error:', error)
    return NextResponse.json(
      { error: 'Failed to update claims' },
      { status: 500 }
    )
  }
}
