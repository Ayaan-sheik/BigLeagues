const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'your_database_name';

// Customer accounts to create
const customerAccounts = [
  {
    name: 'TechStart Solutions',
    email: 'customer1@techstart.com',
    password: 'Customer123!@#',
    company: 'TechStart Solutions',
    industry: 'SaaS',
    founder: 'Rajesh Kumar',
  },
  {
    name: 'InnovateLabs',
    email: 'customer2@innovatelabs.com',
    password: 'Customer456!@#',
    company: 'InnovateLabs Pvt Ltd',
    industry: 'E-commerce',
    founder: 'Priya Sharma',
  },
  {
    name: 'CloudNext Tech',
    email: 'customer3@cloudnext.com',
    password: 'Customer789!@#',
    company: 'CloudNext Technologies',
    industry: 'Cloud Infrastructure',
    founder: 'Amit Patel',
  },
];

async function seedCustomerAccounts() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGO_URL);
    await client.connect();
    
    const db = client.db(DB_NAME);
    
    // Get some products to apply for
    const products = await db.collection('products').find({ status: 'active' }).limit(4).toArray();
    
    if (products.length < 2) {
      console.log('❌ Need at least 2 products in database. Please run seed-admin-accounts.js first.');
      process.exit(1);
    }
    
    console.log('\n👥 Creating Customer Accounts...');
    
    const createdCustomers = [];
    
    for (const customer of customerAccounts) {
      // Check if customer already exists
      const existing = await db.collection('users').findOne({ email: customer.email });
      
      if (existing) {
        console.log(`   ⚠️  Customer ${customer.email} already exists, skipping...`);
        createdCustomers.push(existing);
        continue;
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(customer.password, 12);
      
      const customerUser = {
        id: uuidv4(),
        name: customer.name,
        email: customer.email,
        passwordHash,
        role: 'customer',
        permissions: [],
        twoFactorEnabled: false,
        profileCompleted: true,
        onboardingStep: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
      };
      
      await db.collection('users').insertOne(customerUser);
      console.log(`   ✓ Created: ${customer.email} (Password: ${customer.password})`);
      createdCustomers.push(customerUser);
      
      // Create startup profile
      const profile = {
        id: uuidv4(),
        userId: customerUser.id,
        companyName: customer.company,
        industry: customer.industry,
        businessModel: 'B2B',
        founders: [
          {
            name: customer.founder,
            email: customer.email,
            role: 'CEO',
            experience: Math.floor(Math.random() * 10) + 5,
          },
        ],
        monthlyRevenue: Math.floor(Math.random() * 500000) + 100000,
        fundingStage: ['Seed', 'Series A', 'Series B'][Math.floor(Math.random() * 3)],
        onboardingStatus: 'completed',
        apiKey: `sk_${require('crypto').randomBytes(32).toString('hex')}`,
        environment: 'sandbox',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await db.collection('startup_profiles').insertOne(profile);
      console.log(`      ✓ Created profile for ${customer.company}`);
    }
    
    console.log('\n📝 Creating Applications (2 per customer)...');
    
    let totalApplications = 0;
    
    for (let i = 0; i < createdCustomers.length; i++) {
      const customer = createdCustomers[i];
      const customerData = customerAccounts[i];
      
      console.log(`\n   Customer: ${customer.email}`);
      
      // Create 2 applications per customer
      for (let j = 0; j < 2; j++) {
        const product = products[j % products.length];
        const productPrice = Math.floor(Math.random() * 50000) + 10000;
        const requestedCoverage = productPrice * (Math.floor(Math.random() * 20) + 10);
        const recommendedPremium = Math.ceil((productPrice / 10000) * product.basePrice);
        
        const application = {
          id: uuidv4(),
          applicationNumber: `APP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          userId: customer.id,
          companyName: customerData.company,
          industry: customerData.industry,
          founderName: customerData.founder,
          founderEmail: customer.email,
          productId: product.id,
          productName: product.name,
          productPrice: productPrice,
          requestedCoverage: requestedCoverage,
          coverageAmount: requestedCoverage,
          status: ['new', 'under_review'][j % 2], // Alternate status
          riskScore: Math.floor(Math.random() * 50) + 20,
          recommendedPremium: recommendedPremium,
          actualPremium: null,
          assignedUnderwriter: j === 1 ? 'Underwriting Team' : null,
          documents: [],
          underwriterNotes: '',
          createdAt: new Date(Date.now() - (j * 24 * 60 * 60 * 1000)), // Stagger dates
          updatedAt: new Date(),
        };
        
        await db.collection('applications').insertOne(application);
        console.log(`      ✓ Application ${j + 1}: ${product.name} (${application.status})`);
        totalApplications++;
        
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    console.log('\n✅ Seeding Complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Customers Created: ${createdCustomers.length}`);
    console.log(`   - Applications Created: ${totalApplications}`);
    console.log(`   - Applications per Customer: 2`);
    
    console.log('\n🔐 Customer Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const customer of customerAccounts) {
      const dbCustomer = createdCustomers.find(c => c.email === customer.email);
      console.log(`   Company: ${customer.company}`);
      console.log(`   Email: ${customer.email}`);
      console.log(`   Password: ${customer.password}`);
      console.log(`   ID: ${dbCustomer?.id || 'N/A'}`);
      console.log('   ──────────────────────────────────────────────────');
    }
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ Error seeding customer accounts:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connection closed.\n');
    }
  }
}

seedCustomerAccounts();
