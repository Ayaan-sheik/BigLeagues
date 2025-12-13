import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';
import { logAuditEvent, calculateDiff } from '@/lib/audit-logger';

export async function PATCH(request, { params }) {
  const startTime = Date.now();
  let originalData = null;
  
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    const body = await request.json();

    // Fetch original data for diff
    originalData = await db.collection('applications').findOne({ id });

    const result = await db.collection('applications').updateOne(
      { id },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      await logAuditEvent({
        action: 'update',
        entityType: 'application',
        entityId: id,
        method: 'PATCH',
        endpoint: `/api/admin/applications/${id}`,
        status: 404,
        severity: 'medium',
        responseTime: Date.now() - startTime,
      });
      
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updatedApp = await db.collection('applications').findOne({ id });

    // Determine action type
    const action = body.status ? (body.status === 'approved' ? 'approve' : body.status === 'rejected' ? 'reject' : 'update') : 'update';

    // Log audit event with diff
    await logAuditEvent({
      action,
      entityType: 'application',
      entityId: id,
      method: 'PATCH',
      endpoint: `/api/admin/applications/${id}`,
      status: 200,
      severity: action === 'approve' || action === 'reject' ? 'high' : 'medium',
      changes: {
        diff: calculateDiff(originalData, body),
        after: body,
      },
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(updatedApp);
  } catch (error) {
    console.error('Error updating application:', error);
    
    await logAuditEvent({
      action: 'update',
      entityType: 'application',
      entityId: params.id,
      method: 'PATCH',
      endpoint: `/api/admin/applications/${params.id}`,
      status: 500,
      severity: 'critical',
      responseTime: Date.now() - startTime,
    });
    
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
