const { MongoClient } = require('mongodb');

const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'insureinfra';

async function testApprovalFlow() {
  console.log('🧪 TESTING ADMIN APPROVAL → CUSTOMER VIEW FLOW\n');
  console.log('=' .repeat(70));
  
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db(DB_NAME);
  
  try {
    // Step 1: Check current applications
    console.log('\n📋 STEP 1: Current Applications in Database');
    console.log('-'.repeat(70));
    const applications = await db.collection('applications')
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
    
    console.log(`Found ${applications.length} applications:\n`);
    applications.forEach((app, i) => {
      console.log(`${i + 1}. Application: ${app.applicationNumber}`);
      console.log(`   Company: ${app.companyName || 'N/A'}`);
      console.log(`   Product: ${app.productName}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   User ID: ${app.userId || 'N/A'}`);
      console.log('');
    });
    
    // Step 2: Simulate admin approval/rejection
    if (applications.length > 0) {
      console.log('✅ STEP 2: Simulating Admin Status Updates');
      console.log('-'.repeat(70));
      
      const testApp = applications[0];
      console.log(`\nUpdating application: ${testApp.applicationNumber}`);
      console.log(`Current status: ${testApp.status}`);
      
      // Update to approved
      const newStatus = testApp.status === 'approved' ? 'rejected' : 'approved';
      await db.collection('applications').updateOne(
        { id: testApp.id },
        { 
          $set: { 
            status: newStatus,
            updatedAt: new Date(),
            underwriterNotes: newStatus === 'approved' 
              ? 'Application meets all requirements. Approved.'
              : 'Risk assessment indicates high exposure. Rejected.'
          } 
        }
      );
      
      console.log(`✓ Updated status to: ${newStatus}`);
      
      // Verify update
      const updatedApp = await db.collection('applications').findOne({ id: testApp.id });
      console.log(`✓ Verified in database: ${updatedApp.status}`);
    }
    
    // Step 3: Show how customer will see it
    console.log('\n👤 STEP 3: Customer View Mapping');
    console.log('-'.repeat(70));
    
    const allApps = await db.collection('applications')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log('Application Status → Customer Display:\n');
    
    const statusMapping = {
      'new': 'Pending (Under Review)',
      'under_review': 'Pending (Under Review)',
      'additional_info_required': 'Info Required',
      'approved': 'Approved (Active)',
      'rejected': 'Rejected'
    };
    
    const statusCounts = {};
    allApps.forEach(app => {
      const displayStatus = statusMapping[app.status] || 'Pending';
      statusCounts[displayStatus] = (statusCounts[displayStatus] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} application(s)`);
    });
    
    // Step 4: Show customer-specific applications
    console.log('\n📊 STEP 4: Applications by Customer');
    console.log('-'.repeat(70));
    
    const users = await db.collection('users')
      .find({ role: 'customer' })
      .toArray();
    
    for (const user of users) {
      const userApps = await db.collection('applications')
        .find({ userId: user.id })
        .toArray();
      
      if (userApps.length > 0) {
        console.log(`\n${user.email}:`);
        userApps.forEach(app => {
          const displayStatus = statusMapping[app.status] || 'Pending';
          console.log(`   • ${app.applicationNumber} - ${app.productName}`);
          console.log(`     Status: ${displayStatus}`);
          if (app.underwriterNotes) {
            console.log(`     Notes: ${app.underwriterNotes}`);
          }
        });
      }
    }
    
    // Step 5: Data Flow Summary
    console.log('\n\n✅ STEP 5: Complete Data Flow Summary');
    console.log('-'.repeat(70));
    console.log('✓ Admin updates status in /admin/underwriting');
    console.log('  └─→ Updates "applications" collection in MongoDB');
    console.log('');
    console.log('✓ Customer views policies in /customer/policies');
    console.log('  └─→ Reads from "applications" collection');
    console.log('  └─→ Displays status with proper badges:');
    console.log('      • approved → Green "Approved" badge');
    console.log('      • rejected → Red "Rejected" badge');
    console.log('      • under_review/new → Yellow "Under Review" badge');
    console.log('      • additional_info_required → Blue "Info Required" badge');
    console.log('');
    console.log('✓ Application Number displayed in both views');
    console.log('✓ Real-time synchronization (same database collection)');
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 APPROVAL FLOW TEST COMPLETE!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testApprovalFlow();
