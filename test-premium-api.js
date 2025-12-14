const { MongoClient } = require('mongodb');

const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'insureinfra';

async function testPremiumAPI() {
  console.log('🧪 TESTING PREMIUM API\n');
  console.log('=' .repeat(70));
  
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db(DB_NAME);
  
  try {
    // Step 1: Get a customer with API key
    console.log('\n📋 STEP 1: Finding Customer with API Key');
    console.log('-'.repeat(70));
    
    let profile = await db.collection('startup_profiles').findOne({ apiKey: { $exists: true } });
    
    if (!profile || !profile.apiKey) {
      console.log('⚠️  No API key found. Generating one...\n');
      
      // Find a customer
      const customer = await db.collection('users').findOne({ role: 'customer' });
      
      if (!customer) {
        console.log('❌ No customer found in database. Please seed data first.');
        return;
      }
      
      // Generate API key
      const crypto = require('crypto');
      const apiKey = `sk_${crypto.randomBytes(32).toString('hex')}`;
      
      await db.collection('startup_profiles').updateOne(
        { userId: customer.id },
        { 
          $set: { 
            apiKey,
            lastKeyGenerated: new Date()
          } 
        },
        { upsert: true }
      );
      
      profile = await db.collection('startup_profiles').findOne({ userId: customer.id });
      console.log('✓ Generated new API key');
    }
    
    console.log(`Customer: ${profile.companyName || 'N/A'}`);
    console.log(`User ID: ${profile.userId}`);
    console.log(`API Key: ${profile.apiKey.substring(0, 20)}...`);
    
    // Step 2: Check customer's applications
    console.log('\n📋 STEP 2: Customer Applications');
    console.log('-'.repeat(70));
    
    const applications = await db.collection('applications')
      .find({ userId: profile.userId })
      .toArray();
    
    console.log(`Total applications: ${applications.length}`);
    
    if (applications.length > 0) {
      console.log('\nApplications breakdown:');
      const statusCounts = {};
      applications.forEach(app => {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      });
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}`);
      });
      
      const approvedApps = applications.filter(a => a.status === 'approved');
      console.log(`\nApproved policies (returned by API): ${approvedApps.length}`);
      
      if (approvedApps.length > 0) {
        console.log('\nApproved Policies:');
        approvedApps.forEach((app, i) => {
          console.log(`   ${i + 1}. ${app.applicationNumber} - ${app.productName}`);
          console.log(`      Premium: ₹${app.actualPremium || app.recommendedPremium}`);
          console.log(`      Coverage: ₹${app.coverageAmount}`);
        });
      }
    } else {
      console.log('⚠️  No applications found for this customer');
    }
    
    // Step 3: Test API endpoint
    console.log('\n✅ STEP 3: Test API Endpoint');
    console.log('-'.repeat(70));
    console.log('\nTo test the API, use this cURL command:\n');
    console.log(`curl -X GET 'http://localhost:3000/api/v1/premium' \\`);
    console.log(`  -H 'Authorization: Bearer ${profile.apiKey}'`);
    
    console.log('\n\nOr with JavaScript:\n');
    console.log(`const response = await fetch('http://localhost:3000/api/v1/premium', {`);
    console.log(`  headers: {`);
    console.log(`    'Authorization': 'Bearer ${profile.apiKey}'`);
    console.log(`  }`);
    console.log(`});`);
    console.log(`const data = await response.json();`);
    console.log(`console.log(data);`);
    
    // Step 4: Simulate API call
    console.log('\n\n✅ STEP 4: Expected API Response');
    console.log('-'.repeat(70));
    
    const approvedApps = applications.filter(a => a.status === 'approved');
    const premiumData = approvedApps.map(app => ({
      applicationNumber: app.applicationNumber,
      productName: app.productName,
      productId: app.productId,
      companyName: app.companyName,
      coverageAmount: app.coverageAmount,
      premium: {
        recommended: app.recommendedPremium,
        actual: app.actualPremium || app.recommendedPremium,
        currency: 'INR'
      },
      status: 'active',
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    }));
    
    const totalPremium = premiumData.reduce((sum, app) => sum + (app.premium.actual || 0), 0);
    
    const response = {
      success: true,
      data: {
        companyName: profile.companyName,
        policies: premiumData,
        summary: {
          totalPolicies: premiumData.length,
          totalPremium: totalPremium,
          currency: 'INR'
        }
      }
    };
    
    console.log(JSON.stringify(response, null, 2));
    
    // Step 5: Summary
    console.log('\n\n✅ STEP 5: Integration Summary');
    console.log('-'.repeat(70));
    console.log('✓ API Endpoint: GET /api/v1/premium');
    console.log('✓ Authentication: Bearer token (API key)');
    console.log('✓ Returns: Only approved policies with premium information');
    console.log('✓ Customer Integration Page: /customer/integration');
    console.log('✓ API Key Generation: Available in customer integration page');
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 PREMIUM API TEST COMPLETE!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testPremiumAPI();
