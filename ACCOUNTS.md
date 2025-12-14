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

## 🔄 Complete Data Flow

### 1️⃣ Admin Creates Products (`/admin/products`)
**Action**: Admin clicks "Add Product" button and fills form
- Product Name
- Description
- Base Price
- Min/Max Coverage
- Status (active/draft/archived)

**API**: `POST /api/admin/products`
**Storage**: Saved to `products` collection in MongoDB
**Result**: Product becomes available for customers to apply

### 2️⃣ Customer Views Products (`/customer/policies` → New Application)
**Action**: Customer navigates to apply for new policy
**API**: `GET /api/customer/products/search`
**Source**: Reads from `products` collection (admin-created products)
**Display**: Shows all active products with search functionality

### 3️⃣ Customer Submits Application (`/customer/policies/apply`)
**Action**: Customer selects product and fills application form
- Company Name
- Industry
- Founder Name
- Founder Email
- Product Price
- Requested Coverage

**API**: `POST /api/customer/applications`
**Storage**: Saved to `applications` collection in MongoDB
**Result**: 
- Application appears in `/admin/underwriting`
- Notification sent to admin
- Application visible in customer's policy list

### 4️⃣ Admin Reviews Application (`/admin/underwriting`)
**Action**: Admin views all customer applications in Kanban board
**API**: `GET /api/admin/applications`
**Source**: Reads from `applications` collection (customer submissions)
**Statuses**:
- New Applications
- Under Review
- Info Required
- Approved
- Rejected

### 📊 Database Collections

```
MongoDB: insureinfra
├── products (Admin creates, Customer reads)
│   └── Used by: /admin/products, /customer/policies/apply
│
├── applications (Customer creates, Admin reads)
│   └── Used by: /customer/applications, /admin/underwriting
│
└── users (Both admin and customer accounts)
    └── Used by: Authentication across all routes
```

### ✅ Data Flow Verification

Run this command to test the complete data flow:
```bash
cd /app && node test-data-flow.js
```

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
