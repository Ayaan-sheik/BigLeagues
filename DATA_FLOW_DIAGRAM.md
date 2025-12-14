# 🔄 InsureInfra Data Flow Diagram

## Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MONGODB DATABASE                             │
│                         (insureinfra)                                │
│                                                                      │
│  ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐   │
│  │   products   │   │  applications    │   │      users       │   │
│  │              │   │                  │   │                  │   │
│  │ - id         │   │ - id             │   │ - id             │   │
│  │ - name       │   │ - productId  ────┼───┼─→ references    │   │
│  │ - basePrice  │   │ - userId     ────┼───┼─→ products      │   │
│  │ - coverage   │   │ - companyName    │   │ - email          │   │
│  │ - status     │   │ - status         │   │ - role           │   │
│  └──────────────┘   └──────────────────┘   │ - passwordHash   │   │
│         ▲                     ▲             └──────────────────┘   │
│         │                     │                                     │
└─────────┼─────────────────────┼─────────────────────────────────────┘
          │                     │
          │ WRITE               │ WRITE
          │ (POST)              │ (POST)
          │                     │
    ┌─────┴─────┐         ┌─────┴──────┐
    │   ADMIN   │         │  CUSTOMER  │
    └───────────┘         └────────────┘
```

## Flow Breakdown

### 🔵 Admin Flow (Product Management & Underwriting)

#### Part A: Product Creation

```
ADMIN LOGIN
    │
    ├─→ /admin/products
    │       │
    │       ├─→ Click "Add Product"
    │       │       │
    │       │       └─→ Fill Form:
    │       │           - Name: "Product Liability Insurance"
    │       │           - Description: "Coverage for..."
    │       │           - Base Price: ₹15
    │       │           - Coverage: ₹100K - ₹5M
    │       │           - Status: active
    │       │
    │       ├─→ Submit
    │       │       │
    │       │       └─→ API: POST /api/admin/products
    │       │               │
    │       │               └─→ MongoDB.products.insertOne()
    │       │
    │       └─→ Product Created! ✅
    │
    └─→ /admin/underwriting
            │
            └─→ View Customer Applications
                    │
                    └─→ API: GET /api/admin/applications
                            │
                            └─→ MongoDB.applications.find()
                                    │
                                    └─→ Display in Kanban:
                                        - New Applications
                                        - Under Review
                                        - Approved
                                        - Rejected
```

#### Part B: Application Review & Approval

```
ADMIN LOGIN
    │
    └─→ /admin/underwriting
            │
            ├─→ View Applications in Kanban Board
            │       │
            │       └─→ API: GET /api/admin/applications
            │               │
            │               └─→ MongoDB.applications.find()
            │                       │
            │                       └─→ Display by status:
            │                           - New Applications
            │                           - Under Review
            │                           - Info Required
            │                           - Approved
            │                           - Rejected
            │
            └─→ Drag Application to "Approved" or "Rejected"
                    │
                    └─→ API: PATCH /api/admin/applications/:id
                            │
                            ├─→ MongoDB.applications.updateOne()
                            │   - status: 'approved' or 'rejected'
                            │   - underwriterNotes: "Reason..."
                            │   - updatedAt: Date
                            │
                            └─→ ✅ Status Updated!
                                    │
                                    └─→ Customer sees updated status
                                        in /customer/policies
```

### 🟢 Customer Flow (Application Submission & Status Check)

```
CUSTOMER LOGIN
    │
    ├─→ /customer/policies
    │       │
    │       └─→ Click "Apply for New Policy"
    │               │
    │               └─→ /customer/policies/apply
    │                       │
    │                       ├─→ Load Products
    │                       │       │
    │                       │       └─→ API: GET /api/customer/products/search
    │                       │               │
    │                       │               └─→ MongoDB.products.find({ status: 'active' })
    │                       │
    │                       ├─→ Select Product: "Product Liability Insurance"
    │                       │
    │                       ├─→ Fill Application Form:
    │                       │   - Company Name: "TechStart Solutions"
    │                       │   - Industry: "SaaS"
    │                       │   - Founder: "John Doe"
    │                       │   - Email: "john@techstart.com"
    │                       │   - Product Price: ₹500,000
    │                       │   - Coverage: ₹10,000,000
    │                       │
    │                       └─→ Submit Application
    │                               │
    │                               └─→ API: POST /api/customer/applications
    │                                       │
    │                                       ├─→ MongoDB.applications.insertOne()
    │                                       │   - status: 'new'
    │                                       │   - userId: <customer_id>
    │                                       │   - productId: <product_id>
    │                                       │
    │                                       └─→ Application Created! ✅
    │                                               │
    │                                               └─→ Appears in /admin/underwriting
    │
    └─→ View Application Status
            │
            └─→ /customer/policies
                    │
                    └─→ API: GET /api/customer/policies
                            │
                            └─→ MongoDB.applications.find({ userId: <id> })
                                    │
                                    └─→ Display with Status Badges:
                                        • approved → 🟢 "Approved" (Green)
                                        • rejected → 🔴 "Rejected" (Red)
                                        • under_review/new → 🟡 "Under Review" (Yellow)
                                        • additional_info_required → 🔵 "Info Required" (Blue)
                                        
                                        Shows for each application:
                                        - Application Number (e.g., APP-2024-001)
                                        - Product Name
                                        - Coverage Amount
                                        - Premium
                                        - Status Badge
                                        - Underwriter Notes (if rejected/info required)
                                        - Applied Date
```

## 📋 API Endpoints Reference

### Admin Endpoints

| Endpoint | Method | Purpose | Database Collection |
|----------|--------|---------|---------------------|
| `/api/admin/products` | GET | List all products | `products` |
| `/api/admin/products` | POST | Create new product | `products` |
| `/api/admin/products/:id` | PUT | Update product | `products` |
| `/api/admin/products/:id` | DELETE | Delete product | `products` |
| `/api/admin/applications` | GET | List all applications | `applications` |
| `/api/admin/applications/:id` | PATCH | Update application status | `applications` |

### Customer Endpoints

| Endpoint | Method | Purpose | Database Collection |
|----------|--------|---------|---------------------|
| `/api/customer/products/search` | GET | Search available products | `products` (read-only) |
| `/api/customer/applications` | GET | List user's applications | `applications` |
| `/api/customer/applications` | POST | Submit new application | `applications` |
| `/api/customer/policies` | GET | List approved policies | `applications` (status='approved') |

## 🔐 Data Relationships

```
┌──────────┐
│  USER    │
│  (Admin) │
└────┬─────┘
     │ creates
     ▼
┌──────────┐
│ PRODUCT  │◄────┐
└────┬─────┘     │
     │           │ references
     │           │
     │ reads     │
     ▼           │
┌──────────┐     │
│  USER    │     │
│(Customer)│     │
└────┬─────┘     │
     │ creates   │
     ▼           │
┌──────────────┐ │
│ APPLICATION  ├─┘
└──────────────┘
```

## 🧪 Testing the Flow

### Method 1: Manual Testing

1. **Login as Admin**: `admin1@insureinfra.com` / `Admin123!@#`
2. **Create Product**: Go to `/admin/products` → Add Product
3. **Logout**
4. **Login as Customer**: `customer1@techstart.com` / `Customer123!@#`
5. **Apply for Policy**: Go to `/customer/policies` → New Application
6. **Select Product**: Choose the product you created
7. **Fill Form**: Submit application
8. **Logout**
9. **Login as Admin**: Check `/admin/underwriting`
10. **Verify**: Your application appears in "New Applications"

### Method 2: Automated Testing

```bash
cd /app && node test-data-flow.js
```

This script verifies:
- ✅ Products exist in database
- ✅ Applications exist in database
- ✅ Applications reference valid products
- ✅ Applications reference valid users
- ✅ Data integrity across collections

## 🎯 Key Takeaways

1. **Single Source of Truth**: All data stored in MongoDB `insureinfra` database
2. **Shared Collections**: `products` collection used by both admin and customer
3. **Role-Based Access**: Middleware ensures admins can't access customer routes and vice versa
4. **Real-Time Sync**: Applications immediately visible to admins after customer submission
5. **Data Integrity**: Foreign key relationships maintained between products and applications

## 📊 Collection Schemas

### Products Collection
```javascript
{
  id: "uuid",
  name: "Product Liability Insurance",
  description: "Coverage for product defects...",
  basePrice: 15,
  coverageMin: 100000,
  coverageMax: 5000000,
  status: "active",
  category: "Liability",
  createdBy: "admin_id",
  createdAt: Date,
  updatedAt: Date
}
```

### Applications Collection
```javascript
{
  id: "uuid",
  applicationNumber: "APP-1234-ABCD",
  userId: "customer_id",
  productId: "product_id",
  productName: "Product Liability Insurance",
  companyName: "TechStart Solutions",
  industry: "SaaS",
  founderName: "John Doe",
  founderEmail: "john@techstart.com",
  productPrice: 500000,
  requestedCoverage: 10000000,
  status: "new",  // new, under_review, approved, rejected
  recommendedPremium: 750,
  createdAt: Date,
  updatedAt: Date
}
```

---

**Last Updated**: December 14, 2024
**System**: InsureInfra v1.0
