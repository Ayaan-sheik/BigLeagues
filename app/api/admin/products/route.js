import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

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
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const { v4: uuidv4 } = await import('uuid');
    const product = {
      id: uuidv4(),
      ...body,
      status: body.status || 'active',
      createdAt: new Date(),
    };

    await db.collection('products').insertOne(product);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
