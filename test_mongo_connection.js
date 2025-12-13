const { MongoClient } = require('mongodb');

async function testConnection() {
  const url = 'mongodb://localhost:27017';
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    console.log('✅ MongoDB connection successful!');
    
    const db = client.db('insureinfra_db');
    const collections = await db.listCollections().toArray();
    console.log('✅ Database accessible');
    console.log(`📊 Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      collections.forEach(col => console.log(`  - ${col.name}`));
    }
    
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
