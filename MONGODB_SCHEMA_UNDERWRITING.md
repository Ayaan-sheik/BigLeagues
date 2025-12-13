# MongoDB Schema for Underwriting System

## Overview
The underwriting system uses MongoDB collections to manage the complete insurance lifecycle from application to policy issuance.

---

## 📋 Collection: `applications`

This is the core collection for the underwriting workflow. Applications move through different stages via a Kanban-style interface.

### Schema Structure

```javascript
{
  // Identifiers
  id: "uuid-v4",                              // Primary identifier
  applicationNumber: "APP-2024-001",          // Human-readable number
  
  // Company Information
  companyName: "FutureAI Systems",            // Applicant company name
  industry: "SaaS",                           // Industry sector
  founderName: "Vikram Singh",                // Founder full name
  founderEmail: "vikram@futureai.com",        // Contact email
  
  // Coverage Request
  requestedCoverage: "Product Liability + Founder Risk", // Type(s) requested
  productId: "uuid-of-product",               // Links to products collection
  productPrice: 25000,                        // Customer's product retail price
  coverageAmount: 3000000,                    // Coverage limit requested
  
  // Underwriting Status
  status: "new",                              // Workflow status (see below)
  riskScore: 42,                              // Calculated risk (0-100)
  recommendedPremium: 1250,                   // AI/algorithm recommendation
  actualPremium: 1300,                        // Final premium set by underwriter
  assignedUnderwriter: "Underwriting Team",   // Assigned team/person
  
  // Additional Information
  businessModel: "B2B SaaS",                  // Optional
  monthlyRevenue: 500000,                     // Optional
  teamSize: 25,                               // Optional
  previousInsurance: true,                    // Optional
  claimsHistory: [],                          // Optional array
  documents: [                                // Uploaded documents
    {
      type: "incorporation_certificate",
      url: "s3://...",
      uploadedAt: Date
    }
  ],
  underwriterNotes: "Strong financials...",   // Internal notes
  
  // Timestamps
  createdAt: Date("2024-03-10"),             // Application submitted
  updatedAt: Date("2024-03-12"),             // Last modification
  approvedAt: Date("2024-03-12"),            // Approval timestamp (if approved)
  rejectedAt: Date,                           // Rejection timestamp (if rejected)
  
  // Sync with customer onboarding
  userId: "uuid",                             // Links to users collection
  profileId: "uuid"                           // Links to startup_profiles
}
```

---

### Application Status Workflow

The `status` field moves through these stages in the admin underwriting dashboard:

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNDERWRITING KANBAN BOARD                     │
├─────────────┬──────────────┬────────────────┬──────────┬────────┤
│    NEW      │ UNDER_REVIEW │  INFO_REQUIRED │ APPROVED │REJECTED│
├─────────────┼──────────────┼────────────────┼──────────┼────────┤
│ • Initial   │ • Being      │ • Waiting for  │ • Ready  │ • Not  │
│   submission│   analyzed   │   additional   │   to be  │   fit  │
│ • Awaiting  │ • Risk       │   info from    │   issued │   for  │
│   assignment│   scoring    │   customer     │          │   cover│
└─────────────┴──────────────┴────────────────┴──────────┴────────┘

Drag & Drop between columns updates the status
```

**Valid Status Values:**
- `new` - Just submitted, not yet reviewed
- `under_review` - Assigned to underwriter, being analyzed
- `additional_info_required` - Need more information from customer
- `approved` - Underwriting approved, ready to issue policy
- `rejected` - Application rejected

---

## 📋 Related Collections

### `products` - Insurance Products

```javascript
{
  id: "uuid",
  name: "Product Liability Insurance",
  description: "Coverage for product defects, recalls, and warranty claims",
  basePrice: 15,                             // Base premium per ₹10k of product
  coverageMin: 100000,                       // Minimum coverage
  coverageMax: 5000000,                      // Maximum coverage
  status: "active",
  features: [
    "Product recall coverage",
    "Manufacturing defects",
    "Warranty claims"
  ],
  exclusions: [
    "Intentional fraud",
    "Known defects"
  ],
  createdAt: Date
}
```

**Product Types:**
1. Product Liability Insurance
2. Founder Risk Coverage
3. VC Portfolio Protection
4. Refund Protection

---

### `startups` - Customer Companies

```javascript
{
  id: "uuid",
  name: "TechFlow Hardware",
  industry: "Hardware & IoT",
  foundedDate: Date("2022-03-15"),
  founderName: "Rajesh Kumar",
  founderEmail: "rajesh@techflow.com",
  teamSize: 25,
  fundingStage: "Series A",                  // Pre-seed, Seed, Series A/B/C
  revenue: 5000000,                          // Annual revenue
  riskScore: 35,                             // Overall risk (lower is better)
  status: "active",
  onboardingStatus: "active",                // kyc, active, suspended
  totalPolicies: 3,
  totalPremiumMTD: 45000,                    // Premium collected this month
  lastActivity: Date,
  createdAt: Date
}
```

---

### `policies` - Issued Policies

**Created when application status = 'approved'**

```javascript
{
  id: "uuid",
  policyNumber: "POL-timestamp-random",      // Unique policy number
  
  // Customer Reference
  startupId: "uuid",                         // Links to startups
  startupName: "TechFlow Hardware",
  userId: "uuid",                            // User who owns this
  
  // Product Reference
  productId: "uuid",                         // Insurance product
  productName: "Product Liability Insurance",
  
  // Coverage Details
  coverageAmount: 1000000,                   // Coverage limit
  premiumAmount: 1500,                       // Premium per transaction (if per-tx)
  premiumType: "per-transaction",            // or "monthly", "annual"
  deductible: 50000,                         // Deductible amount
  
  // Coverage Terms
  coverageDetails: {
    productDefects: true,
    recalls: true,
    warrantyBreaches: true,
    legalDefense: true
  },
  exclusions: [
    "Intentional fraud",
    "Known defects at policy start"
  ],
  
  // Status & Dates
  status: "active",                          // active, expired, cancelled, suspended
  startDate: Date("2024-01-01"),
  endDate: Date("2024-12-31"),
  
  // Premium Tracking
  totalPremiumCollected: 150000,             // Sum of all premiums paid
  transactionCount: 100,                     // Number of transactions covered
  
  // Admin tracking
  createdBy: "admin-user-id",
  createdAt: Date,
  updatedAt: Date,
  updatedBy: "admin-user-id"
}
```

---

### `claims` - Filed Claims

**Claims are filed against policies**

```javascript
{
  id: "uuid",
  claimNumber: "CLM-2024-001",
  
  // References
  userId: "uuid",                            // Customer user
  startupId: "uuid",                         // Customer company
  startupName: "TechFlow Hardware",
  policyId: "uuid",                          // Policy being claimed against
  policyNumber: "POL-123456",
  productName: "Product Liability Insurance",
  
  // Claim Details
  claimAmount: 250000,                       // Amount requested
  approvedAmount: 250000,                    // Amount approved (if approved)
  claimType: "Product Defect",               // Type of claim
  incidentDate: Date("2024-02-15"),          // When incident occurred
  filedDate: Date("2024-02-20"),             // When claim was filed
  description: "Mass recall due to battery defect",
  
  // Workflow
  status: "new",                             // new, under_investigation, approved, rejected, paid, withdrawn
  priority: "high",                          // low, medium, high
  assignedTo: "Claims Team",                 // Adjuster assignment
  
  // Evidence
  evidenceDocuments: [
    {
      type: "incident_report",
      url: "s3://...",
      uploadedAt: Date
    }
  ],
  
  // Notes
  adjusterNotes: "Valid claim, approved full amount",
  internalNotes: "Fast-track for good customer",
  customerNotes: "Additional photos uploaded",
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  paidAt: Date                               // Payment timestamp
}
```

---

### `transactions` - Premium Transactions

**Created when customer's integration records a sale**

```javascript
{
  id: "uuid",
  transactionId: "TXN-timestamp-random",     // Unique transaction ID
  
  // Customer Reference
  userId: "uuid",
  apiKey: "sk_64char...",                    // Customer's API key
  startupName: "TechFlow Hardware",
  
  // Transaction Details
  productSold: "Premium Widget",             // Customer's product name
  saleAmount: 10000,                         // Sale price
  premiumAmount: 15,                         // Insurance premium collected
  
  // Policy Reference
  policyId: "uuid",                          // Which policy covers this
  policyType: "Product Liability Insurance",
  
  // Customer Info (optional)
  customerInfo: {
    email: "buyer@example.com",
    phone: "+91...",
    address: "..."
  },
  
  // Status
  status: "completed",                       // completed, failed, refunded
  settlementStatus: "pending",               // pending, processing, completed
  
  // Timestamps
  date: Date,                                // Transaction date
  createdAt: Date,
  settledAt: Date                            // When premium was settled
}
```

---

### `notifications` - Real-time Notifications

**Created when actions occur to notify the other party**

```javascript
{
  id: "uuid",
  type: "new_claim",                         // Event type
  title: "New Claim Filed",
  message: "TechFlow Hardware filed a new claim for ₹250000",
  
  // Entity Reference
  entityType: "claim",                       // claim, policy, transaction, application
  entityId: "uuid",                          // ID of the entity
  
  // Recipient
  userId: "uuid",                            // For customer notifications
  recipientRole: "admin",                    // For admin notifications
  
  // Status
  read: false,
  readAt: Date,
  
  createdAt: Date
}
```

**Notification Types:**
- `new_application` - Customer submitted application
- `application_status_changed` - Underwriter updated status
- `new_claim` - Customer filed claim
- `claim_updated` - Admin updated claim status
- `policy_activated` - New policy issued
- `policy_updated` - Policy modified
- `transaction_recorded` - Premium collected
- `settlement_updated` - Payment processed

---

### `startup_profiles` - Detailed Customer Profiles

**Created during customer onboarding**

```javascript
{
  id: "uuid",
  userId: "uuid",                            // Links to users collection
  
  // Company Info (from Step 1)
  companyName: "TechFlow Hardware",
  industry: "Hardware & IoT",
  businessModel: "B2B",
  incorporationDate: Date,
  companyAddress: "...",
  
  // Founders (from Step 2)
  founders: [
    {
      name: "Rajesh Kumar",
      email: "rajesh@techflow.com",
      role: "CEO",
      experience: 10
    }
  ],
  
  // Business Details (from Step 3)
  productsServices: ["IoT Devices", "Smart Sensors"],
  monthlyRevenue: 500000,
  fundingStage: "Series A",
  customerBase: 1000,
  
  // Risk Assessment (from Step 4)
  previousInsurance: true,
  claimsHistory: "None in last 3 years",
  qualityControlProcesses: "ISO 9001 certified",
  certifications: ["ISO 9001", "CE"],
  
  // Insurance Needs (from Step 5)
  interestedProducts: ["Product Liability", "Founder Risk"],
  estimatedTransactionVolume: 10000,
  averageOrderValue: 5000,
  
  // Documents (from Step 6)
  documents: {
    incorporation_certificate: "url",
    pan_card: "url",
    gst_certificate: "url"
  },
  
  // Integration
  apiKey: "sk_64char...",                    // Generated API key
  webhookUrl: "https://customer.com/webhook",
  environment: "live",                       // sandbox or live
  lastKeyGenerated: Date,
  
  // Status
  onboardingStatus: "pending_review",        // Syncs to applications collection
  riskScore: 35,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Data Flow: Application to Policy

### 1. Customer Completes Onboarding
```javascript
// Creates startup_profiles document
{
  userId: "user-123",
  companyName: "NewStartup",
  onboardingStatus: "pending_review",
  ...
}
```

### 2. System Creates Application
```javascript
// Automatically creates applications document
{
  id: "app-456",
  applicationNumber: "APP-2024-005",
  companyName: "NewStartup",
  userId: "user-123",
  profileId: "profile-789",
  status: "new",
  ...
}

// Creates notification for admin
{
  type: "new_application",
  message: "NewStartup submitted application",
  recipientRole: "admin"
}
```

### 3. Admin Reviews in Underwriting Dashboard
```javascript
// Admin drags card from "New" to "Under Review"
PATCH /api/admin/applications/app-456
{
  status: "under_review",
  assignedUnderwriter: "John Doe",
  riskScore: 42,
  recommendedPremium: 1500
}
```

### 4. Admin Approves Application
```javascript
// Admin drags to "Approved" column
PATCH /api/admin/applications/app-456
{
  status: "approved",
  actualPremium: 1500,
  approvedAt: Date.now()
}

// System creates policy
POST /api/admin/policies
{
  applicationId: "app-456",
  userId: "user-123",
  startupName: "NewStartup",
  productName: "Product Liability",
  coverageAmount: 2000000,
  premiumAmount: 1500,
  status: "active"
}

// Creates notification for customer
{
  type: "policy_activated",
  userId: "user-123",
  message: "Your Product Liability policy is now active"
}
```

### 5. Customer Sees Policy Immediately
```javascript
// Customer dashboard automatically shows new policy
GET /api/customer/policies
// Returns the newly created policy

// Customer sees notification
GET /api/customer/notifications
// Shows "policy_activated" notification
```

---

## 📊 Collections Summary Table

| Collection | Purpose | Created By | Updated By |
|------------|---------|------------|------------|
| `applications` | Underwriting queue | Customer onboarding + System | Admin (underwriter) |
| `products` | Insurance product catalog | Admin | Admin |
| `startups` | Customer company data | Customer registration | Customer + Admin |
| `startup_profiles` | Detailed customer profiles | Customer onboarding | Customer |
| `policies` | Issued insurance policies | Admin (on approval) | Admin |
| `claims` | Filed claims | Customer | Admin (claims team) |
| `transactions` | Premium transactions | Customer API integration | Admin (settlements) |
| `notifications` | Real-time alerts | System (on events) | Users (mark read) |

---

## 🔗 Key Relationships

```
users
  └─ startup_profiles (userId)
      ├─ applications (userId, profileId)
      │   └─ policies (applicationId, userId)
      │       ├─ transactions (policyId, userId)
      │       └─ claims (policyId, userId)
      └─ notifications (userId)

products
  ├─ applications (productId)
  └─ policies (productId)
```

---

## 🎯 Indexes for Performance

Recommended indexes for the underwriting system:

```javascript
// applications collection
db.applications.createIndex({ status: 1, createdAt: -1 })
db.applications.createIndex({ userId: 1 })
db.applications.createIndex({ applicationNumber: 1 }, { unique: true })

// policies collection
db.policies.createIndex({ userId: 1, status: 1 })
db.policies.createIndex({ policyNumber: 1 }, { unique: true })
db.policies.createIndex({ startupId: 1 })

// claims collection
db.claims.createIndex({ userId: 1, status: 1 })
db.claims.createIndex({ policyId: 1 })
db.claims.createIndex({ claimNumber: 1 }, { unique: true })

// transactions collection
db.transactions.createIndex({ userId: 1, date: -1 })
db.transactions.createIndex({ apiKey: 1, date: -1 })
db.transactions.createIndex({ policyId: 1 })
db.transactions.createIndex({ transactionId: 1 }, { unique: true })

// startup_profiles collection
db.startup_profiles.createIndex({ userId: 1 }, { unique: true })
db.startup_profiles.createIndex({ apiKey: 1 }, { unique: true, sparse: true })

// notifications collection
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 })
db.notifications.createIndex({ recipientRole: 1, read: 1, createdAt: -1 })
```

---

## ✅ Current Implementation Status

- ✅ Applications collection with full CRUD
- ✅ Kanban-style underwriting dashboard
- ✅ Drag-and-drop status updates
- ✅ Risk scoring and premium calculation
- ✅ Policies created on approval
- ✅ Sync between admin and customer dashboards
- ✅ Real-time notifications system
- ✅ Claims management with status workflow
- ✅ Transaction tracking with API key
- ✅ Audit logging for all changes
- ✅ Customer onboarding → Application → Policy flow
