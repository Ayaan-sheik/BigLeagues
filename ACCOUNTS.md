# 🔐 All Account Credentials

## System Overview
- **Total Admin Accounts:** 3
- **Total Customer Accounts:** 3  
- **Total Products:** 12 (4 per admin)
- **Total Applications:** 6 (2 per customer)
- **Database:** MongoDB
- **Password Hashing:** bcrypt (12 rounds)

---

## 👨‍💼 Admin Accounts

### Admin Account 1
- **Name:** Admin One
- **Email:** `admin1@insureinfra.com`
- **Password:** `Admin123!@#`
- **ID:** `d03c7002-bb45-4494-b52a-ab1ce6ef3d77`
- **Role:** admin
- **Products Created:** 4
- **Access:** `/admin` dashboard, all admin routes

### Admin Account 2
- **Name:** Admin Two
- **Email:** `admin2@insureinfra.com`
- **Password:** `Admin456!@#`
- **ID:** `a21fb33d-3ebc-46c9-acd7-ecee8e8809dd`
- **Role:** admin
- **Products Created:** 4
- **Access:** `/admin` dashboard, all admin routes

### Admin Account 3
- **Name:** Admin Three
- **Email:** `admin3@insureinfra.com`
- **Password:** `Admin789!@#`
- **ID:** `ae018d57-433c-47f5-bb5f-db13e875e649`
- **Role:** admin
- **Products Created:** 4
- **Access:** `/admin` dashboard, all admin routes

---

## 👥 Customer Accounts

### Customer Account 1
- **Company:** TechStart Solutions
- **Email:** `customer1@techstart.com`
- **Password:** `Customer123!@#`
- **ID:** `705bb46e-2da0-4efe-80bc-1c8773a9b7ae`
- **Role:** customer
- **Industry:** SaaS
- **Founder:** Rajesh Kumar
- **Applications Submitted:** 2
  - Product Liability Insurance (status: new)
  - Founder Risk Coverage (status: under_review)
- **Access:** `/customer` dashboard, all customer routes

### Customer Account 2
- **Company:** InnovateLabs Pvt Ltd
- **Email:** `customer2@innovatelabs.com`
- **Password:** `Customer456!@#`
- **ID:** `dabc2574-1b57-47ed-85e2-62356db11abb`
- **Role:** customer
- **Industry:** E-commerce
- **Founder:** Priya Sharma
- **Applications Submitted:** 2
  - Product Liability Insurance (status: new)
  - Founder Risk Coverage (status: under_review)
- **Access:** `/customer` dashboard, all customer routes

### Customer Account 3
- **Company:** CloudNext Technologies
- **Email:** `customer3@cloudnext.com`
- **Password:** `Customer789!@#`
- **ID:** `2b356ec6-f87b-43ad-b863-6b7b9ce37f77`
- **Role:** customer
- **Industry:** Cloud Infrastructure
- **Founder:** Amit Patel
- **Applications Submitted:** 2
  - Product Liability Insurance (status: new)
  - Founder Risk Coverage (status: under_review)
- **Access:** `/customer` dashboard, all customer routes

---

## 📦 Products in Database (12 Total)

### Category: Liability
**Product Liability Insurance**
- Created by: All 3 admins (3 instances)
- Description: Coverage for product defects, recalls, and warranty claims
- Coverage Range: ₹1L - ₹50L
- Status: Active

### Category: Risk Management
**Founder Risk Coverage**
- Created by: All 3 admins (3 instances)
- Description: Protection against founder misconduct, fraud, or key person loss
- Coverage Range: ₹5L - ₹100L
- Status: Active

### Category: Business Protection
**Business Interruption Insurance**
- Created by: All 3 admins (3 instances)
- Description: Covers loss of income due to business disruptions
- Coverage Range: ₹2L - ₹80L
- Status: Active

### Category: Technology
**Cyber Security Insurance**
- Created by: All 3 admins (3 instances)
- Description: Protection against data breaches and cyber attacks
- Coverage Range: ₹3L - ₹150L
- Status: Active

---

## 📋 Applications in Database (6 Total)

### Applications from TechStart Solutions (customer1@techstart.com)
1. **Application #1**
   - Product: Product Liability Insurance
   - Status: new
   - Company: TechStart Solutions
   - Founder: Rajesh Kumar
   - Visible in: `/admin/underwriting` (NEW column)

2. **Application #2**
   - Product: Founder Risk Coverage
   - Status: under_review
   - Company: TechStart Solutions
   - Founder: Rajesh Kumar
   - Visible in: `/admin/underwriting` (UNDER REVIEW column)

### Applications from InnovateLabs (customer2@innovatelabs.com)
3. **Application #3**
   - Product: Product Liability Insurance
   - Status: new
   - Company: InnovateLabs Pvt Ltd
   - Founder: Priya Sharma
   - Visible in: `/admin/underwriting` (NEW column)

4. **Application #4**
   - Product: Founder Risk Coverage
   - Status: under_review
   - Company: InnovateLabs Pvt Ltd
   - Founder: Priya Sharma
   - Visible in: `/admin/underwriting` (UNDER REVIEW column)

### Applications from CloudNext (customer3@cloudnext.com)
5. **Application #5**
   - Product: Product Liability Insurance
   - Status: new
   - Company: CloudNext Technologies
   - Founder: Amit Patel
   - Visible in: `/admin/underwriting` (NEW column)

6. **Application #6**
   - Product: Founder Risk Coverage
   - Status: under_review
   - Company: CloudNext Technologies
   - Founder: Amit Patel
   - Visible in: `/admin/underwriting` (UNDER REVIEW column)

---

## 🔒 Route Protection

### Protected Routes
All routes now require authentication and role-based authorization:

**Admin Routes (requires role: 'admin')**
- `/admin` - Admin dashboard
- `/admin/*` - All admin pages
- `/api/admin/*` - All admin API endpoints

**Customer Routes (requires role: 'customer')**
- `/customer` - Customer dashboard
- `/customer/*` - All customer pages
- `/api/customer/*` - All customer API endpoints

**Public Routes (no authentication)**
- `/` - Landing page
- `/auth/login` - Login page
- `/auth/register` - Registration page

### Authorization Rules
- Admins attempting to access `/customer` routes → redirected to `/admin`
- Customers attempting to access `/admin` routes → redirected to `/customer`
- Unauthenticated users → redirected to `/auth/login`
- API endpoints return 403 Forbidden if wrong role

---

## 🧪 Testing Instructions

### Test Admin Login
1. Go to: `http://localhost:3000/auth/login`
2. Email: `admin1@insureinfra.com`
3. Password: `Admin123!@#`
4. Should redirect to: `/admin`
5. Can access: All admin features
6. Cannot access: `/customer` routes (will redirect)

### Test Customer Login
1. Go to: `http://localhost:3000/auth/login`
2. Email: `customer1@techstart.com`
3. Password: `Customer123!@#`
4. Should redirect to: `/customer`
5. Can access: All customer features
6. Cannot access: `/admin` routes (will redirect)

### Test Applications Flow
1. Login as Admin (any admin account)
2. Go to `/admin/underwriting`
3. Should see 6 applications:
   - 3 in "NEW" column
   - 3 in "UNDER REVIEW" column
4. Drag an application to "APPROVED"
5. Login as corresponding customer
6. Check `/customer/policies` - approved policy should appear

### Test Route Protection
1. Logout (if logged in)
2. Try to access `/admin` → Should redirect to login
3. Login as customer
4. Try to access `/admin` → Should redirect to `/customer`
5. Logout
6. Login as admin
7. Try to access `/customer` → Should redirect to `/admin`

---

## 💾 Database Collections

### Current State
```javascript
// users collection
{
  admins: 3,
  customers: 3,
  total: 6
}

// products collection
{
  products: 12,
  status: 'active',
  categories: ['Liability', 'Risk Management', 'Business Protection', 'Technology']
}

// applications collection
{
  applications: 6,
  statuses: {
    'new': 3,
    'under_review': 3
  }
}

// startup_profiles collection
{
  profiles: 3,
  allComplete: true,
  withApiKeys: true
}
```

---

## 🔧 Maintenance Commands

### Re-seed Admin Accounts
```bash
cd /app && node scripts/seed-admin-accounts.js
```

### Re-seed Customer Accounts
```bash
cd /app && node scripts/seed-customer-accounts.js
```

### Verify Database
```bash
cd /app && node -e "
const { MongoClient } = require('mongodb');
(async () => {
  const c = new MongoClient('mongodb://localhost:27017');
  await c.connect();
  const db = c.db('your_database_name');
  console.log('Admins:', await db.collection('users').countDocuments({role:'admin'}));
  console.log('Customers:', await db.collection('users').countDocuments({role:'customer'}));
  console.log('Products:', await db.collection('products').countDocuments());
  console.log('Applications:', await db.collection('applications').countDocuments());
  await c.close();
})();
"
```

### Clean All Data
```bash
cd /app && node scripts/clean-database.js
```

---

## 📊 Dashboard Features

### Admin Dashboard (`/admin`)
- View all applications in Kanban board
- Drag-and-drop to change status
- Auto-create policies on approval
- View all customers
- Manage products
- View analytics (real data only)
- Logout button → redirects to `/`

### Customer Dashboard (`/customer`)
- View policies (only if approved)
- Submit new applications
- Search available products (12 products)
- File claims
- View transactions
- Real-time data (no mock data)
- Logout button → redirects to `/`

---

## ⚠️ Important Notes

1. **No Mock Data:** All dashboards now show only real data from MongoDB
2. **Base Price Hidden:** Customers cannot see product base pricing
3. **Route Protection:** All routes are protected by middleware
4. **Role-Based Access:** Admins and customers have separate dashboards
5. **Real Applications:** 6 real applications exist for testing
6. **Password Security:** All passwords are bcrypt hashed (12 rounds)

---

## 🎯 Quick Reference Card

| Need | Use This Account | Password |
|------|-----------------|----------|
| Test Admin Features | admin1@insureinfra.com | Admin123!@# |
| Test Another Admin | admin2@insureinfra.com | Admin456!@# |
| Test Customer with Apps | customer1@techstart.com | Customer123!@# |
| Test E-commerce Customer | customer2@innovatelabs.com | Customer456!@# |
| Test Tech Customer | customer3@cloudnext.com | Customer789!@# |

**Default redirect after login:**
- Admin → `/admin`
- Customer → `/customer`
- Logout → `/` (landing page)
