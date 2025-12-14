import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

/**
 * Public API endpoint to get premium information for customer's products
 * Requires API key authentication
 */
export async function GET(request) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Missing or invalid Authorization header. Use: Authorization: Bearer YOUR_API_KEY'
        },
        { status: 401 }
      )
    }

    const apiKey = authHeader.replace('Bearer ', '')

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const serviceIdFilter = searchParams.get('serviceId') // Filter by service ID
    const premiumFilter = searchParams.get('premium') // Filter by premium amount

    // Validate API key and get user
    const db = await getDb()
    const profile = await db.collection('startup_profiles')
      .findOne({ apiKey })

    if (!profile) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Invalid API key'
        },
        { status: 401 }
      )
    }

    // Build query filter
    const query = { 
      userId: profile.userId,
      status: 'approved' // Only show approved policies
    }

    // Add service ID filter if provided
    if (serviceIdFilter) {
      query.applicationNumber = serviceIdFilter
    }

    // Get user's applications (approved policies)
    let applications = await db.collection('applications')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    // Apply premium filter if provided
    if (premiumFilter) {
      const premiumAmount = parseInt(premiumFilter)
      if (!isNaN(premiumAmount)) {
        applications = applications.filter(app => 
          (app.actualPremium || app.recommendedPremium) === premiumAmount
        )
      }
    }

    // Format response with serviceId instead of applicationNumber
    const premiumData = applications.map(app => ({
      serviceId: app.applicationNumber, // Renamed from applicationNumber
      productName: app.productName,
      productId: app.productId,
      companyName: app.companyName,
      coverageAmount: app.coverageAmount,
      premium: {
        recommended: app.recommendedPremium,
        actual: app.actualPremium || app.recommendedPremium,
        currency: 'INR'
      },
      status: 'active',
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    }))

    // Calculate total premium
    const totalPremium = premiumData.reduce(
      (sum, app) => sum + (app.premium.actual || 0), 
      0
    )

    return NextResponse.json({
      success: true,
      data: {
        companyName: profile.companyName,
        policies: premiumData,
        summary: {
          totalPolicies: premiumData.length,
          totalPremium: totalPremium,
          currency: 'INR'
        }
      }
    })
  } catch (error) {
    console.error('Get premium error:', error)
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to fetch premium information'
      },
      { status: 500 }
    )
  }
}
