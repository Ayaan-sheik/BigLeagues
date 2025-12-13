import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    const claims = await db.collection('claims')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ claims })
  } catch (error) {
    console.error('Get claims error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const db = await getDb()

    // Get policy details
    const policy = await db.collection('policies').findOne({ 
      id: body.policyId,
      userId: session.user.id 
    })

    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 })
    }

    // Get user details
    const user = await db.collection('users').findOne({ id: session.user.id })

    // Get startup profile
    const profile = await db.collection('startup_profiles').findOne({ userId: session.user.id })

    const claim = {
      id: uuidv4(),
      claimNumber: `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId: session.user.id,
      startupName: profile?.companyName || user?.name || 'Unknown',
      policyId: body.policyId,
      policyNumber: policy.policyNumber,
      productName: policy.productName || 'General Insurance',
      incidentDate: body.incidentDate,
      description: body.description,
      claimAmount: parseFloat(body.claimAmount),
      claimType: body.claimType || 'General',
      status: 'new',
      priority: 'medium',
      evidenceDocuments: body.evidenceDocuments || [],
      adjusterNotes: '',
      internalNotes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('claims').insertOne(claim)

    // Create notification for admin
    await db.collection('notifications').insertOne({
      id: uuidv4(),
      type: 'new_claim',
      title: 'New Claim Filed',
      message: `${claim.startupName} filed a new claim for ₹${claim.claimAmount}`,
      entityType: 'claim',
      entityId: claim.id,
      recipientRole: 'admin',
      read: false,
      createdAt: new Date(),
    })

    return NextResponse.json({ claim }, { status: 201 })
  } catch (error) {
    console.error('Create claim error:', error)
    return NextResponse.json(
      { error: 'Failed to file claim' },
      { status: 500 }
    )
  }
}
