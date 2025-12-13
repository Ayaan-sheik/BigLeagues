const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'your_database_name';

// Admin accounts to create
const adminAccounts = [
  {
    name: 'Admin One',
    email: 'admin1@insureinfra.com',
    password: 'Admin123!@#',
  },
  {
    name: 'Admin Two',
    email: 'admin2@insureinfra.com',
    password: 'Admin456!@#',
  },
  {
    name: 'Admin Three',
    email: 'admin3@insureinfra.com',
    password: 'Admin789!@#',
  },
];

// Products for each admin (4 products each)
const productsPerAdmin = [
  {
    name: 'Product Liability Insurance',
    description: 'Coverage for product defects, recalls, and warranty claims',
    category: 'Liability',
    basePrice: 15,
    coverageMin: 100000,
    coverageMax: 5000000,
  },
  {
    name: 'Founder Risk Coverage',
    description: 'Protection against founder misconduct, fraud, or key person loss',
    category: 'Risk Management',
    basePrice: 25,
    coverageMin: 500000,
    coverageMax: 10000000,
  },
  {
    name: 'Business Interruption Insurance',
    description: 'Covers loss of income due to business disruptions',
    category: 'Business Protection',
    basePrice: 30,
    coverageMin: 200000,
    coverageMax: 8000000,
  },
  {
    name: 'Cyber Security Insurance',
    description: 'Protection against data breaches and cyber attacks',
    category: 'Technology',
    basePrice: 40,
    coverageMin: 300000,
    coverageMax: 15000000,
  },
];

async function seedAdminAccounts() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGO_URL);
    await client.connect();
    
    const db = client.db(DB_NAME);
    
    console.log('\n👥 Creating Admin Accounts...');
    
    const createdAdmins = [];
    
    for (const admin of adminAccounts) {
      // Check if admin already exists
      const existing = await db.collection('users').findOne({ email: admin.email });
      
      if (existing) {
        console.log(`   ⚠️  Admin ${admin.email} already exists, skipping...`);
        createdAdmins.push(existing);
        continue;
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(admin.password, 12);
      
      const adminUser = {
        id: uuidv4(),
        name: admin.name,
        email: admin.email,
        passwordHash,
        role: 'admin',
        permissions: ['create_product', 'manage_applications', 'view_analytics'],
        twoFactorEnabled: false,
        profileCompleted: true,
        onboardingStep: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
      };
      
      await db.collection('users').insertOne(adminUser);
      console.log(`   ✓ Created: ${admin.email} (Password: ${admin.password})`);
      createdAdmins.push(adminUser);
    }
    
    console.log('\n📦 Creating Products for Each Admin...');
    
    let totalProducts = 0;
    
    for (let i = 0; i < createdAdmins.length; i++) {
      const admin = createdAdmins[i];
      console.log(`\n   Admin: ${admin.email}`);
      
      for (const productTemplate of productsPerAdmin) {
        const product = {
          id: uuidv4(),
          productNumber: `PRD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          name: productTemplate.name,
          description: productTemplate.description,
          category: productTemplate.category,
          basePrice: productTemplate.basePrice,
          coverageMin: productTemplate.coverageMin,
          coverageMax: productTemplate.coverageMax,
          status: 'active',
          features: [
            'Comprehensive coverage',
            '24/7 claim support',
            'Quick approval process',
            'Flexible payment options',
          ],
          exclusions: [
            'Pre-existing conditions',
            'Intentional fraud',
            'War or terrorism',
          ],
          createdBy: admin.id,
          createdByName: admin.name,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await db.collection('products').insertOne(product);
        console.log(`      ✓ ${product.name} (${product.productNumber})`);
        totalProducts++;
      }
    }
    
    console.log('\n✅ Seeding Complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Admins Created: ${createdAdmins.length}`);
    console.log(`   - Products Created: ${totalProducts}`);
    console.log(`   - Products per Admin: ${productsPerAdmin.length}`);
    
    console.log('\n🔐 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const admin of adminAccounts) {
      const dbAdmin = createdAdmins.find(a => a.email === admin.email);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${admin.password}`);
      console.log(`   ID: ${dbAdmin?.id || 'N/A'}`);
      console.log('   ──────────────────────────────────────────────────');
    }
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ Error seeding admin accounts:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connection closed.\n');
    }
  }
}

seedAdminAccounts();
