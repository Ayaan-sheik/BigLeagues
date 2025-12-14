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
    
    // Get all applications (which include status: new, under_review, approved, rejected, etc.)
    const applications = await db.collection('applications')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()
    
    // Transform applications to policy format for display
    const policies = applications.map(app => ({
      id: app.id,
      policyNumber: app.applicationNumber, // Use application number as policy number
      userId: app.userId,
      productName: app.productName,
      productId: app.productId,
      companyName: app.companyName,
      coverageAmount: app.coverageAmount || app.requestedCoverage,
      premium: app.actualPremium || app.recommendedPremium,
      // Map application status to display status
      status: app.status === 'approved' ? 'active' : 
              app.status === 'rejected' ? 'rejected' : 
              app.status === 'under_review' ? 'pending' : 
              app.status === 'additional_info_required' ? 'info_required' : 
              'pending',
      applicationStatus: app.status, // Keep original status
      applicationNumber: app.applicationNumber,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      // Additional info
      industry: app.industry,
      founderName: app.founderName,
      riskScore: app.riskScore,
      underwriterNotes: app.underwriterNotes,
    }))

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
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const db = await getDb()

    const policy = {
      id: uuidv4(),
      userId: session.user.id,
      policyNumber: `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      ...body,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('policies').insertOne(policy)

    return NextResponse.json({ policy }, { status: 201 })
  } catch (error) {
    console.error('Create policy error:', error)
    return NextResponse.json(
      { error: 'Failed to create policy application' },
      { status: 500 }
    )
  }
}
