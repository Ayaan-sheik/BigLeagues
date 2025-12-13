import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const startups = await db
      .collection('startups')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(startups);
  } catch (error) {
    console.error('Error fetching startups:', error);
    return NextResponse.json({ error: 'Failed to fetch startups' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const { v4: uuidv4 } = await import('uuid');
    const startup = {
      id: uuidv4(),
      ...body,
      status: body.status || 'lead',
      onboardingStatus: body.onboardingStatus || 'lead',
      totalPolicies: 0,
      totalPremiumMTD: 0,
      riskScore: body.riskScore || null,
      createdAt: new Date(),
      lastActivity: new Date(),
    };

    await db.collection('startups').insertOne(startup);

    return NextResponse.json(startup, { status: 201 });
  } catch (error) {
    console.error('Error creating startup:', error);
    return NextResponse.json({ error: 'Failed to create startup' }, { status: 500 });
  }
}
