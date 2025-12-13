import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const auditLogs = await db
      .collection('audit_logs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
