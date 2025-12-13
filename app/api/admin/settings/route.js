import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

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
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

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

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
