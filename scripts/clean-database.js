const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'your_database_name';

async function cleanDatabase() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGO_URL);
    await client.connect();
    
    const db = client.db(DB_NAME);
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    console.log(`\n📊 Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    if (collections.length === 0) {
      console.log('\n✅ Database is already empty!');
      return;
    }
    
    console.log('\n🗑️  Dropping all collections...');
    
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`   ✓ Dropped: ${collection.name}`);
    }
    
    console.log('\n✅ Database cleaned successfully!');
    console.log('🎉 All collections have been removed.\n');
    
  } catch (error) {
    console.error('\n❌ Error cleaning database:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connection closed.\n');
    }
  }
}

cleanDatabase();
