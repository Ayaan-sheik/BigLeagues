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
    originalData = await db.collection('claims').findOne({ id });

    const result = await db.collection('claims').updateOne(
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
        entityType: 'claim',
        entityId: id,
        method: 'PATCH',
        endpoint: `/api/admin/claims/${id}`,
        status: 404,
        severity: 'medium',
        responseTime: Date.now() - startTime,
      });
      
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    const updatedClaim = await db.collection('claims').findOne({ id });

    // Determine action type and severity
    let action = 'update';
    let severity = 'medium';
    
    if (body.status) {
      if (body.status === 'approved') {
        action = 'approve';
        severity = 'high';
      } else if (body.status === 'rejected') {
        action = 'reject';
        severity = 'high';
      } else if (body.status === 'paid') {
        action = 'payout';
        severity = 'critical'; // Financial transaction
      }
    }

    // Log audit event with diff
    await logAuditEvent({
      action,
      entityType: 'claim',
      entityId: id,
      method: 'PATCH',
      endpoint: `/api/admin/claims/${id}`,
      status: 200,
      severity,
      changes: {
        diff: calculateDiff(originalData, body),
        after: body,
      },
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(updatedClaim);
  } catch (error) {
    console.error('Error updating claim:', error);
    
    await logAuditEvent({
      action: 'update',
      entityType: 'claim',
      entityId: params.id,
      method: 'PATCH',
      endpoint: `/api/admin/claims/${params.id}`,
      status: 500,
      severity: 'critical',
      responseTime: Date.now() - startTime,
    });
    
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 });
  }
}
