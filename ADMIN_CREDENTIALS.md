# 🔐 Admin Accounts & Access

## Admin Credentials

### Admin Account 1
- **Email:** `admin1@insureinfra.com`
- **Password:** `Admin123!@#`
- **ID:** `d03c7002-bb45-4494-b52a-ab1ce6ef3d77`
- **Products Created:** 4

### Admin Account 2
- **Email:** `admin2@insureinfra.com`
- **Password:** `Admin456!@#`
- **ID:** `a21fb33d-3ebc-46c9-acd7-ecee8e8809dd`
- **Products Created:** 4

### Admin Account 3
- **Email:** `admin3@insureinfra.com`
- **Password:** `Admin789!@#`
- **ID:** `ae018d57-433c-47f5-bb5f-db13e875e649`
- **Products Created:** 4

---

## Products Created (12 Total)

### For Each Admin (4 products each):

#### 1. **Product Liability Insurance**
- **Description:** Coverage for product defects, recalls, and warranty claims
- **Category:** Liability
- **Base Price:** ₹15 per ₹10,000 of product value
- **Coverage Range:** ₹1L - ₹50L
- **Status:** Active

#### 2. **Founder Risk Coverage**
- **Description:** Protection against founder misconduct, fraud, or key person loss
- **Category:** Risk Management
- **Base Price:** ₹25 per ₹10,000
- **Coverage Range:** ₹5L - ₹100L
- **Status:** Active

#### 3. **Business Interruption Insurance**
- **Description:** Covers loss of income due to business disruptions
- **Category:** Business Protection
- **Base Price:** ₹30 per ₹10,000
- **Coverage Range:** ₹2L - ₹80L
- **Status:** Active

#### 4. **Cyber Security Insurance**
- **Description:** Protection against data breaches and cyber attacks
- **Category:** Technology
- **Base Price:** ₹40 per ₹10,000
- **Coverage Range:** ₹3L - ₹150L
- **Status:** Active

---

## How to Login

1. Go to `/auth/login`
2. Enter one of the admin emails above
3. Enter the corresponding password
4. You'll be redirected to `/admin` dashboard

---

## What Each Admin Can Do

✅ View all customer applications in `/admin/underwriting`
✅ Manage applications (drag-and-drop Kanban board)
✅ Create new insurance products
✅ Review and approve/reject applications
✅ View all claims, policies, transactions
✅ Access analytics and reports
✅ Manage customer accounts
✅ Logout (redirects to landing page)

---

## Database Structure

### Collections Created:
- `users` - All user accounts (3 admins + any customers)
- `products` - 12 insurance products (4 per admin)
- `applications` - Customer policy applications
- `policies` - Approved and active policies
- `claims` - Customer claims
- `transactions` - Premium transactions
- `notifications` - Real-time alerts

### Sample MongoDB Document for Admin:
```javascript
{
  id: "d03c7002-bb45-4494-b52a-ab1ce6ef3d77",
  name: "Admin One",
  email: "admin1@insureinfra.com",
  passwordHash: "$2a$12$...", // bcrypt hashed
  role: "admin",
  permissions: [
    "create_product",
    "manage_applications",
    "view_analytics"
  ],
  profileCompleted: true,
  onboardingStep: 7,
  createdAt: Date,
  updatedAt: Date
}
```

### Sample Product Document:
```javascript
{
  id: "uuid",
  productNumber: "PRD-1765667199766-JVXFGV",
  name: "Product Liability Insurance",
  description: "Coverage for product defects, recalls, and warranty claims",
  category: "Liability",
  basePrice: 15,
  coverageMin: 100000,
  coverageMax: 5000000,
  status: "active",
  features: [
    "Comprehensive coverage",
    "24/7 claim support",
    "Quick approval process",
    "Flexible payment options"
  ],
  exclusions: [
    "Pre-existing conditions",
    "Intentional fraud",
    "War or terrorism"
  ],
  createdBy: "d03c7002-bb45-4494-b52a-ab1ce6ef3d77",
  createdByName: "Admin One",
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing the Complete Flow

### As Admin:
1. Login with admin credentials
2. Go to `/admin` - see dashboard
3. Check products in database (12 products total)
4. Wait for customer applications to appear in underwriting
5. Logout button in sidebar - redirects to `/`

### As Customer:
1. Register a new customer account
2. Login and go to `/customer`
3. Navigate to `/customer/policies`
4. Click "New Application" button
5. Search for products (will show all 12 products)
6. Select a product
7. Fill application form:
   - Company Name
   - Industry
   - Founder Name
   - Founder Email
   - Product Price
   - Requested Coverage
8. Submit application
9. Application appears in `/admin/underwriting` for admins
10. Logout button in sidebar - redirects to `/`

### Application Approval Flow:
1. Admin sees application in "New" column
2. Admin drags to "Under Review"
3. Admin reviews and drags to "Approved"
4. System auto-creates policy
5. Customer sees policy in `/customer/policies`

---

## Quick Commands

### Re-seed Admin Accounts (if needed):
```bash
cd /app && node scripts/seed-admin-accounts.js
```

### Clean Database:
```bash
cd /app && node scripts/clean-database.js
```

### Check Database:
```bash
cd /app && node -e "
const { MongoClient } = require('mongodb');
(async () => {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('your_database_name');
  const users = await db.collection('users').find({ role: 'admin' }).toArray();
  const products = await db.collection('products').countDocuments();
  console.log('Admins:', users.length);
  console.log('Products:', products);
  await client.close();
})();
"
```

---

## Security Note

⚠️ **These are demo credentials. In production:**
- Use strong, unique passwords
- Enable 2FA for admin accounts
- Implement role-based access control (RBAC)
- Rotate passwords regularly
- Use environment variables for sensitive data
- Enable audit logging for all admin actions
