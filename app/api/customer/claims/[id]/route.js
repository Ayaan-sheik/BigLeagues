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
    
    const claim = await db.collection('claims').findOne({ 
      id,
      userId: session.user.id 
    })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    return NextResponse.json({ claim })
  } catch (error) {
    console.error('Get claim error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claim' },
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
    
    // Check if claim exists and belongs to user
    const existingClaim = await db.collection('claims').findOne({ 
      id,
      userId: session.user.id 
    })

    if (!existingClaim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    // Only allow edits if status is 'new' or 'info_requested'
    if (!['new', 'info_requested'].includes(existingClaim.status)) {
      return NextResponse.json(
        { error: 'Cannot edit claim in current status' },
        { status: 403 }
      )
    }

    // Update claim
    const result = await db.collection('claims').updateOne(
      { id, userId: session.user.id },
      { 
        $set: { 
          ...body,
          updatedAt: new Date()
        } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Failed to update claim' }, { status: 404 })
    }

    const updatedClaim = await db.collection('claims').findOne({ id })

    return NextResponse.json({ claim: updatedClaim })
  } catch (error) {
    console.error('Update claim error:', error)
    return NextResponse.json(
      { error: 'Failed to update claim' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    const { id } = params
    
    // Check if claim exists and belongs to user
    const existingClaim = await db.collection('claims').findOne({ 
      id,
      userId: session.user.id 
    })

    if (!existingClaim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    // Only allow withdrawal if status is 'new'
    if (existingClaim.status !== 'new') {
      return NextResponse.json(
        { error: 'Cannot withdraw claim in current status' },
        { status: 403 }
      )
    }

    // Soft delete by updating status to 'withdrawn'
    await db.collection('claims').updateOne(
      { id, userId: session.user.id },
      { 
        $set: { 
          status: 'withdrawn',
          withdrawnAt: new Date(),
          updatedAt: new Date()
        } 
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Withdraw claim error:', error)
    return NextResponse.json(
      { error: 'Failed to withdraw claim' },
      { status: 500 }
    )
  }
}
