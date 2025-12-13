import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';
import { calculateRecommendedPremium } from '@/lib/premium-calculator';

export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { applicationId, productId } = body;

    // Fetch application
    const application = await db.collection('applications').findOne({ id: applicationId });
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Fetch startup (if exists)
    const startup = await db.collection('startups').findOne({ 
      $or: [
        { name: application.companyName },
        { founderEmail: application.founderEmail }
      ]
    });

    // Fetch product
    const product = await db.collection('products').findOne({ id: productId || application.productId });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Calculate recommended premium
    const recommendedPremium = await calculateRecommendedPremium(application, startup, product);

    return NextResponse.json({ recommendedPremium });
  } catch (error) {
    console.error('Error calculating premium:', error);
    return NextResponse.json({ error: 'Failed to calculate premium' }, { status: 500 });
  }
}
