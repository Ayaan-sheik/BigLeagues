import { v4 as uuidv4 } from 'uuid';

// Seed function to populate mock data
export async function seedMockData(db) {
  // Check if data already exists
  const existingStartups = await db.collection('startups').countDocuments();
  if (existingStartups > 0) {
    console.log('Mock data already exists, skipping seed...');
    return;
  }

  console.log('Seeding mock data...');

  // 1. Create Products
  const products = [
    {
      id: uuidv4(),
      name: 'Product Liability Insurance',
      description: 'Coverage for product defects, recalls, and warranty claims',
      basePrice: 15,
      coverageMin: 100000,
      coverageMax: 5000000,
      status: 'active',
      createdAt: new Date('2024-01-01'),
    },
    {
      id: uuidv4(),
      name: 'Founder Risk Coverage',
      description: 'Protection against founder misconduct, fraud, or key person loss',
      basePrice: 25,
      coverageMin: 500000,
      coverageMax: 10000000,
      status: 'active',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: uuidv4(),
      name: 'VC Portfolio Protection',
      description: 'Protects capital against business shutdowns',
      basePrice: 50,
      coverageMin: 1000000,
      coverageMax: 50000000,
      status: 'active',
      createdAt: new Date('2024-02-01'),
    },
    {
      id: uuidv4(),
      name: 'Refund Protection',
      description: 'Insurer pays if returns exceed thresholds',
      basePrice: 10,
      coverageMin: 50000,
      coverageMax: 2000000,
      status: 'active',
      createdAt: new Date('2024-02-15'),
    },
  ];

  await db.collection('products').insertMany(products);

  // 2. Create Startups
  const startups = [
    {
      id: uuidv4(),
      name: 'TechFlow Hardware',
      industry: 'Hardware & IoT',
      foundedDate: new Date('2022-03-15'),
      founderName: 'Rajesh Kumar',
      founderEmail: 'rajesh@techflow.com',
      teamSize: 25,
      fundingStage: 'Series A',
      revenue: 5000000,
      riskScore: 35,
      status: 'active',
      onboardingStatus: 'active',
      totalPolicies: 3,
      totalPremiumMTD: 45000,
      lastActivity: new Date(),
      createdAt: new Date('2024-01-10'),
    },
    {
      id: uuidv4(),
      name: 'SwiftCommerce',
      industry: 'D2C Electronics',
      foundedDate: new Date('2021-06-20'),
      founderName: 'Priya Sharma',
      founderEmail: 'priya@swiftcommerce.com',
      teamSize: 40,
      fundingStage: 'Series B',
      revenue: 12000000,
      riskScore: 28,
      status: 'active',
      onboardingStatus: 'active',
      totalPolicies: 5,
      totalPremiumMTD: 89000,
      lastActivity: new Date(),
      createdAt: new Date('2024-01-15'),
    },
    {
      id: uuidv4(),
      name: 'CloudSprint SaaS',
      industry: 'SaaS',
      foundedDate: new Date('2023-01-10'),
      founderName: 'Amit Patel',
      founderEmail: 'amit@cloudsprint.io',
      teamSize: 15,
      fundingStage: 'Seed',
      revenue: 800000,
      riskScore: 45,
      status: 'active',
      onboardingStatus: 'active',
      totalPolicies: 2,
      totalPremiumMTD: 22000,
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date('2024-02-01'),
    },
    {
      id: uuidv4(),
      name: 'NeoLogistics',
      industry: 'Logistics',
      foundedDate: new Date('2020-11-05'),
      founderName: 'Sanjay Mehta',
      founderEmail: 'sanjay@neologistics.in',
      teamSize: 60,
      fundingStage: 'Series C',
      revenue: 25000000,
      riskScore: 22,
      status: 'active',
      onboardingStatus: 'active',
      totalPolicies: 8,
      totalPremiumMTD: 156000,
      lastActivity: new Date(),
      createdAt: new Date('2024-01-05'),
    },
    {
      id: uuidv4(),
      name: 'GreenTech Devices',
      industry: 'Hardware & IoT',
      foundedDate: new Date('2023-08-12'),
      founderName: 'Neha Gupta',
      founderEmail: 'neha@greentech.com',
      teamSize: 12,
      fundingStage: 'Pre-seed',
      revenue: 300000,
      riskScore: 58,
      status: 'active',
      onboardingStatus: 'kyc',
      totalPolicies: 1,
      totalPremiumMTD: 8000,
      lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date('2024-03-01'),
    },
  ];

  await db.collection('startups').insertMany(startups);

  // 3. Create Policies
  const policies = [];
  startups.forEach((startup, idx) => {
    const numPolicies = startup.totalPolicies;
    for (let i = 0; i < numPolicies; i++) {
      policies.push({
        id: uuidv4(),
        startupId: startup.id,
        startupName: startup.name,
        productId: products[i % products.length].id,
        productName: products[i % products.length].name,
        coverageAmount: 1000000 + idx * 500000,
        premium: products[i % products.length].basePrice * 100,
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdAt: new Date('2024-01-15'),
      });
    }
  });

  await db.collection('policies').insertMany(policies);

  // 4. Create Transactions
  const transactions = [];
  startups.forEach((startup) => {
    const numTransactions = Math.floor(Math.random() * 20) + 10;
    for (let i = 0; i < numTransactions; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const productPrice = Math.floor(Math.random() * 50000) + 10000;
      const premium = product.basePrice * Math.ceil(productPrice / 10000);
      
      transactions.push({
        id: uuidv4(),
        startupId: startup.id,
        startupName: startup.name,
        productId: product.id,
        productName: product.name,
        productPrice: productPrice,
        premium: premium,
        totalAmount: productPrice + premium,
        status: 'settled',
        settlementStatus: 'completed',
        paymentGateway: 'dodo',
        gatewayTransactionId: `dodo_${uuidv4().substring(0, 8)}`,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
      });
    }
  });

  await db.collection('transactions').insertMany(transactions);

  // 5. Create Claims
  const claims = [
    {
      id: uuidv4(),
      claimNumber: 'CLM-2024-001',
      startupId: startups[0].id,
      startupName: startups[0].name,
      policyId: policies[0].id,
      productName: products[0].name,
      claimAmount: 250000,
      approvedAmount: 250000,
      claimType: 'Product Defect',
      incidentDate: new Date('2024-02-15'),
      filedDate: new Date('2024-02-20'),
      status: 'paid',
      priority: 'high',
      assignedTo: 'Claims Team',
      description: 'Mass recall due to battery defect',
      createdAt: new Date('2024-02-20'),
    },
    {
      id: uuidv4(),
      claimNumber: 'CLM-2024-002',
      startupId: startups[1].id,
      startupName: startups[1].name,
      policyId: policies[1].id,
      productName: products[3].name,
      claimAmount: 180000,
      approvedAmount: 150000,
      claimType: 'Refund Excess',
      incidentDate: new Date('2024-03-01'),
      filedDate: new Date('2024-03-05'),
      status: 'paid',
      priority: 'medium',
      assignedTo: 'Claims Team',
      description: 'Return rate exceeded 15% threshold',
      createdAt: new Date('2024-03-05'),
    },
    {
      id: uuidv4(),
      claimNumber: 'CLM-2024-003',
      startupId: startups[3].id,
      startupName: startups[3].name,
      policyId: policies[3].id,
      productName: products[1].name,
      claimAmount: 500000,
      approvedAmount: 450000,
      claimType: 'Founder Risk',
      incidentDate: new Date('2024-02-28'),
      filedDate: new Date('2024-03-02'),
      status: 'paid',
      priority: 'high',
      assignedTo: 'Claims Team',
      description: 'Key person loss - CFO departure',
      createdAt: new Date('2024-03-02'),
    },
    {
      id: uuidv4(),
      claimNumber: 'CLM-2024-004',
      startupId: startups[2].id,
      startupName: startups[2].name,
      policyId: policies[2].id,
      productName: products[2].name,
      claimAmount: 300000,
      approvedAmount: 300000,
      claimType: 'VC Portfolio Protection',
      incidentDate: new Date('2024-01-20'),
      filedDate: new Date('2024-01-25'),
      status: 'paid',
      priority: 'high',
      assignedTo: 'Claims Team',
      description: 'Business shutdown risk coverage',
      createdAt: new Date('2024-01-25'),
    },
    {
      id: uuidv4(),
      claimNumber: 'CLM-2024-005',
      startupId: startups[0].id,
      startupName: startups[0].name,
      policyId: policies[0].id,
      productName: products[0].name,
      claimAmount: 120000,
      approvedAmount: 100000,
      claimType: 'Product Defect',
      incidentDate: new Date('2024-01-10'),
      filedDate: new Date('2024-01-15'),
      status: 'paid',
      priority: 'medium',
      assignedTo: 'Claims Team',
      description: 'Hardware malfunction',
      createdAt: new Date('2024-01-15'),
    },
  ];

  await db.collection('claims').insertMany(claims);

  // 6. Create Applications
  const applications = [
    {
      id: uuidv4(),
      applicationNumber: 'APP-2024-001',
      companyName: 'FutureAI Systems',
      industry: 'SaaS',
      founderName: 'Vikram Singh',
      founderEmail: 'vikram@futureai.com',
      requestedCoverage: 'Product Liability + Founder Risk',
      coverageAmount: 3000000,
      status: 'under_review',
      riskScore: 42,
      assignedUnderwriter: 'Underwriting Team',
      createdAt: new Date('2024-03-15'),
    },
    {
      id: uuidv4(),
      applicationNumber: 'APP-2024-002',
      companyName: 'RapidGrow Commerce',
      industry: 'D2C Electronics',
      founderName: 'Ananya Reddy',
      founderEmail: 'ananya@rapidgrow.com',
      requestedCoverage: 'Refund Protection',
      coverageAmount: 1500000,
      status: 'new',
      riskScore: null,
      assignedUnderwriter: null,
      createdAt: new Date('2024-03-18'),
    },
  ];

  await db.collection('applications').insertMany(applications);

  // 7. Create Settings
  const settings = {
    id: uuidv4(),
    companyName: 'InsureInfra',
    companyEmail: 'admin@insureinfra.com',
    dodoApiKey: null,
    dodoSecretKey: null,
    emailProvider: 'sendgrid',
    emailApiKey: null,
    notificationsEnabled: true,
    updatedAt: new Date(),
  };

  await db.collection('settings').insertOne(settings);

  console.log('Mock data seeded successfully!');
}
