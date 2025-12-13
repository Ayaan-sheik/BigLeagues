import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const db = await getDb()

    // Get product details
    const product = await db.collection('products').findOne({ id: body.productId })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate recommended premium if coverage not specified
    const productPrice = parseFloat(body.productPrice)
    const requestedCoverage = body.requestedCoverage ? parseFloat(body.requestedCoverage) : productPrice * 20
    const recommendedPremium = Math.ceil((productPrice / 10000) * product.basePrice)

    // Create application
    const application = {
      id: uuidv4(),
      applicationNumber: `APP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      userId: session.user.id,
      companyName: body.companyName,
      industry: body.industry,
      founderName: body.founderName,
      founderEmail: body.founderEmail,
      productId: body.productId,
      productName: product.name,
      productPrice: productPrice,
      requestedCoverage: requestedCoverage,
      coverageAmount: requestedCoverage,
      status: 'new',
      riskScore: null,
      recommendedPremium: recommendedPremium,
      actualPremium: null,
      assignedUnderwriter: null,
      documents: [],
      underwriterNotes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('applications').insertOne(application)

    // Create notification for admin
    await db.collection('notifications').insertOne({
      id: uuidv4(),
      type: 'new_application',
      title: 'New Policy Application',
      message: `${body.companyName} applied for ${product.name}`,
      entityType: 'application',
      entityId: application.id,
      recipientRole: 'admin',
      read: false,
      createdAt: new Date(),
    })

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error('Create application error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    
    // Get user's applications
    const applications = await db.collection('applications')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
