import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';
import { logAuditEvent, determineAction, determineSeverity } from '@/lib/audit-logger';

export async function GET() {
  const startTime = Date.now();
  try {
    const { db } = await connectToDatabase();

    const startups = await db
      .collection('startups')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Log audit event
    await logAuditEvent({
      action: 'read',
      entityType: 'startups',
      method: 'GET',
      endpoint: '/api/admin/startups',
      status: 200,
      severity: 'low',
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(startups);
  } catch (error) {
    console.error('Error fetching startups:', error);
    
    await logAuditEvent({
      action: 'read',
      entityType: 'startups',
      method: 'GET',
      endpoint: '/api/admin/startups',
      status: 500,
      severity: 'critical',
      responseTime: Date.now() - startTime,
    });
    
    return NextResponse.json({ error: 'Failed to fetch startups' }, { status: 500 });
  }
}

export async function POST(request) {
  const startTime = Date.now();
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

    // Log audit event
    await logAuditEvent({
      action: 'create',
      entityType: 'startup',
      entityId: startup.id,
      method: 'POST',
      endpoint: '/api/admin/startups',
      status: 201,
      severity: 'medium',
      changes: { after: body },
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(startup, { status: 201 });
  } catch (error) {
    console.error('Error creating startup:', error);
    
    await logAuditEvent({
      action: 'create',
      entityType: 'startup',
      method: 'POST',
      endpoint: '/api/admin/startups',
      status: 500,
      severity: 'critical',
      responseTime: Date.now() - startTime,
    });
    
    return NextResponse.json({ error: 'Failed to create startup' }, { status: 500 });
  }
}
