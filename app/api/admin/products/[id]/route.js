import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';
import { logAuditEvent, calculateDiff } from '@/lib/audit-logger';

export async function GET(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;

    const product = await db.collection('products').findOne({ id });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const startTime = Date.now();
  let originalData = null;
  
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    const body = await request.json();

    // Fetch original data for diff
    originalData = await db.collection('products').findOne({ id });

    const result = await db.collection('products').updateOne(
      { id },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = await db.collection('products').findOne({ id });

    // Log audit event
    await logAuditEvent({
      action: 'update',
      entityType: 'product',
      entityId: id,
      method: 'PATCH',
      endpoint: `/api/admin/products/${id}`,
      status: 200,
      severity: 'medium',
      changes: {
        diff: calculateDiff(originalData, body),
        after: body,
      },
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    
    await logAuditEvent({
      action: 'update',
      entityType: 'product',
      entityId: params.id,
      method: 'PATCH',
      endpoint: `/api/admin/products/${params.id}`,
      status: 500,
      severity: 'critical',
      responseTime: Date.now() - startTime,
    });
    
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const startTime = Date.now();
  
  try {
    const { db } = await connectToDatabase();
    const { id } = params;

    // Fetch product before deletion for logging
    const product = await db.collection('products').findOne({ id });

    const result = await db.collection('products').deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Log deletion (high severity)
    await logAuditEvent({
      action: 'delete',
      entityType: 'product',
      entityId: id,
      method: 'DELETE',
      endpoint: `/api/admin/products/${id}`,
      status: 200,
      severity: 'high',
      changes: {
        before: product,
      },
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    
    await logAuditEvent({
      action: 'delete',
      entityType: 'product',
      entityId: params.id,
      method: 'DELETE',
      endpoint: `/api/admin/products/${params.id}`,
      status: 500,
      severity: 'critical',
      responseTime: Date.now() - startTime,
    });
    
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
