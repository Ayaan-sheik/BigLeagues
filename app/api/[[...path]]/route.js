import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  // simple and sufficient for MVP
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // Root endpoint - GET /api/root (since /api/ is not accessible with catch-all)
    if ((route === '/root' || route === '/') && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'Hello World' }))
    }

    // Leads - POST /api/leads (email capture)
    if (route === '/leads' && method === 'POST') {
      const body = await request.json().catch(() => ({}))

      const email = body?.email?.trim()?.toLowerCase()
      if (!isValidEmail(email)) {
        return handleCORS(NextResponse.json({ error: 'Valid email is required' }, { status: 400 }))
      }

      const lead = {
        id: uuidv4(),
        email,
        source: body?.source || 'landing',
        createdAt: new Date(),
      }

      // Mongo driver may mutate the inserted object by adding _id.
      // Keep the response UUID-only.
      const leadDoc = { ...lead }
      const insertRes = await db.collection('leads').insertOne(leadDoc)
      return handleCORS(NextResponse.json({ ...lead, inserted: Boolean(insertRes?.acknowledged) }))
    }

    // Leads - GET /api/leads (simple admin/dev check)
    if (route === '/leads' && method === 'GET') {
      const leads = await db
        .collection('leads')
        .find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray()

      const cleaned = leads.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleaned))
    }

    // Status endpoints - POST /api/status
    if (route === '/status' && method === 'POST') {
      const body = await request.json()

      if (!body.client_name) {
        return handleCORS(NextResponse.json({ error: 'client_name is required' }, { status: 400 }))
      }

      const statusObj = {
        id: uuidv4(),
        client_name: body.client_name,
        timestamp: new Date(),
      }

      await db.collection('status_checks').insertOne(statusObj)
      return handleCORS(NextResponse.json(statusObj))
    }

    // Status endpoints - GET /api/status
    if (route === '/status' && method === 'GET') {
      const statusChecks = await db.collection('status_checks').find({}).limit(1000).toArray()

      // Remove MongoDB's _id field from response
      const cleanedStatusChecks = statusChecks.map(({ _id, ...rest }) => rest)

      return handleCORS(NextResponse.json(cleanedStatusChecks))
    }

    // Route not found
    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
