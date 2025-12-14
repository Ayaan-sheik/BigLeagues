# 🔐 Database Status & Data Flow

## ✅ Database Active

**Database Name**: `insureinfra`
**Status**: Active with seeded data

**Current Data**:
- 👥 Users: Admin (1) + Customer (1) = 2 total
- 📦 Products: 9 active insurance products
- 📋 Applications: 8 customer applications
- 🔄 Data flow: Fully operational

---

## 🔄 To Re-seed the Database

Run these commands to recreate the demo accounts:

### Create Admin Accounts (3 admins with 4 products each)
```bash
cd /app && node scripts/seed-admin-accounts.js
```

### Create Customer Accounts (3 customers with 2 applications each)
```bash
cd /app && node scripts/seed-customer-accounts.js
```

---

## 📝 Default Credentials (After Re-seeding)

### Admin Accounts
- **Admin 1**: admin1@insureinfra.com / Admin123!@#
- **Admin 2**: admin2@insureinfra.com / Admin456!@#
- **Admin 3**: admin3@insureinfra.com / Admin789!@#

### Customer Accounts
- **Customer 1**: customer1@techstart.com / Customer123!@#
- **Customer 2**: customer2@innovatelabs.com / Customer456!@#
- **Customer 3**: customer3@cloudnext.com / Customer789!@#

---

## 🧹 To Clean Database Again

```bash
cd /app && node scripts/clean-database.js
```

Or to completely drop the database:
```bash
cd /app && node -e "
const { MongoClient } = require('mongodb');
(async () => {
  const c = new MongoClient('mongodb://localhost:27017');
  await c.connect();
  await c.db('insureinfra').dropDatabase();
  console.log('✅ Database dropped');
  await c.close();
})();
"
```

---

**Last Updated**: December 14, 2024
**Action**: Database completely cleared at user request
