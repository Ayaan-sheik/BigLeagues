import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';
import { logAuditEvent, calculateDiff } from '@/lib/audit-logger';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    let settings = await db.collection('settings').findOne({});

    // If no settings exist, create default
    if (!settings) {
      const { v4: uuidv4 } = await import('uuid');
      settings = {
        id: uuidv4(),
        companyName: 'InsureInfra',
        companyEmail: 'admin@insureinfra.com',
        dodoApiKey: null,
        dodoSecretKey: null,
        emailProvider: 'sendgrid',
        emailApiKey: null,
        notificationsEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.collection('settings').insertOne(settings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request) {
  const startTime = Date.now();
  let originalData = null;
  
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    // Fetch original settings for diff
    originalData = await db.collection('settings').findOne({});

    const result = await db.collection('settings').updateOne(
      {},
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    const updatedSettings = await db.collection('settings').findOne({});

    // Determine severity - critical if API keys changed
    const severity = (body.dodoApiKey || body.dodoSecretKey || body.emailApiKey) ? 'critical' : 'medium';

    // Log settings update
    await logAuditEvent({
      action: 'update',
      entityType: 'settings',
      entityId: 'global_settings',
      method: 'PUT',
      endpoint: '/api/admin/settings',
      status: 200,
      severity,
      changes: {
        diff: calculateDiff(originalData, body),
        after: body, // Will be sanitized by logger
      },
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    
    await logAuditEvent({
      action: 'update',
      entityType: 'settings',
      method: 'PUT',
      endpoint: '/api/admin/settings',
      status: 500,
      severity: 'critical',
      responseTime: Date.now() - startTime,
    });
    
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
