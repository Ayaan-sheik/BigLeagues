import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';
import { logAuditEvent } from '@/lib/audit-logger';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const products = await db
      .collection('products')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    // Basic validation
    if (body.coverageMin && body.coverageMax && body.coverageMin > body.coverageMax) {
      return NextResponse.json(
        { error: 'Coverage minimum cannot be greater than coverage maximum' },
        { status: 400 }
      );
    }

    const { v4: uuidv4 } = await import('uuid');
    const product = {
      id: uuidv4(),
      ...body,
      status: body.status || 'active',
      createdAt: new Date(),
    };

    await db.collection('products').insertOne(product);

    // Log product creation
    await logAuditEvent({
      action: 'create',
      entityType: 'product',
      entityId: product.id,
      method: 'POST',
      endpoint: '/api/admin/products',
      status: 201,
      severity: 'medium',
      changes: { after: body },
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    
    await logAuditEvent({
      action: 'create',
      entityType: 'product',
      method: 'POST',
      endpoint: '/api/admin/products',
      status: 500,
      severity: 'critical',
      responseTime: Date.now() - startTime,
    });
    
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
