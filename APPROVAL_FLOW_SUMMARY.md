# ✅ Admin Approval → Customer View Flow

## Overview

This document describes how application status updates from the admin underwriting system are synchronized with the customer policy view.

---

## 🔄 Complete Flow

### 1. Admin Reviews Application (In `/admin/underwriting`)

**What Admin Sees:**
- Kanban board with all applications
- Columns: New | Under Review | Info Required | Approved | Rejected
- Each card shows:
  - Application Number (e.g., APP-2024-001)
  - Company Name
  - Product Name
  - Coverage Amount
  - Risk Score

**What Admin Can Do:**
- Drag application cards between columns
- Change status: `new` → `approved` or `rejected`
- Add underwriter notes

**API Called:**
```javascript
PATCH /api/admin/applications/:id
Body: {
  status: "approved", // or "rejected"
  underwriterNotes: "Application meets requirements..."
}
```

**Database Update:**
```javascript
MongoDB.applications.updateOne(
  { id: applicationId },
  { 
    $set: { 
      status: "approved",
      underwriterNotes: "...",
      updatedAt: new Date()
    } 
  }
)
```

---

### 2. Customer Views Updated Status (In `/customer/policies`)

**What Customer Sees:**
- List of all their applications/policies
- Each card shows:
  - ✅ **Application Number** (e.g., APP-1765692230910-A7JRWR)
  - Product Name
  - Company Name
  - Coverage Amount
  - Premium
  - **Status Badge** (color-coded)
  - Applied Date

**Status Badge Mapping:**

| Admin Status | Customer Display | Badge Color | Notes |
|--------------|------------------|-------------|-------|
| `approved` | **Approved** | 🟢 Green | Policy is active |
| `rejected` | **Rejected** | 🔴 Red | Shows rejection reason |
| `new` | **Under Review** | 🟡 Yellow | Being processed |
| `under_review` | **Under Review** | 🟡 Yellow | Being processed |
| `additional_info_required` | **Info Required** | 🔵 Blue | Shows required info |

**API Called:**
```javascript
GET /api/customer/policies
```

**Database Query:**
```javascript
MongoDB.applications.find({ 
  userId: customerId 
})
```

**Response Transformation:**
```javascript
// Applications are transformed to policy format
{
  id: app.id,
  policyNumber: app.applicationNumber, // Application number shown
  status: "active" | "rejected" | "pending" | "info_required",
  applicationNumber: app.applicationNumber,
  productName: app.productName,
  coverageAmount: app.coverageAmount,
  premium: app.actualPremium || app.recommendedPremium,
  underwriterNotes: app.underwriterNotes // Shown if rejected/info required
}
```

---

## 📊 Database Schema

### Applications Collection (Shared by Admin & Customer)

```javascript
{
  id: "uuid",
  applicationNumber: "APP-2024-001", // ✅ Displayed to customer
  userId: "customer_id",
  companyName: "TechStart Solutions",
  productId: "product_id",
  productName: "Product Liability Insurance",
  coverageAmount: 10000000,
  recommendedPremium: 750,
  actualPremium: 800,
  status: "approved", // ✅ Updated by admin
  underwriterNotes: "Approved after review", // ✅ Displayed to customer
  riskScore: 25,
  assignedUnderwriter: "admin_id",
  createdAt: Date,
  updatedAt: Date // ✅ Updated when status changes
}
```

---

## 🎯 Key Features Implemented

### ✅ Real-Time Synchronization
- Admin updates status → Database updated immediately
- Customer refreshes page → Sees updated status
- Both use same `applications` collection

### ✅ Application Number Display
- Generated when customer submits: `APP-{timestamp}-{random}`
- Stored in `applicationNumber` field
- Displayed in both admin underwriting and customer policies

### ✅ Status Updates Persist
- Admin drag-and-drop updates database
- Status persists across page refreshes
- Customer always sees latest status

### ✅ Underwriter Notes
- Admin can add notes when rejecting or requesting info
- Notes are displayed to customer based on status:
  - **Rejected**: Shows in red box with "Rejection Reason"
  - **Info Required**: Shows in blue box with "Required Information"

### ✅ Visual Feedback
- Color-coded badges make status instantly recognizable
- Approved applications show "Download Policy" button
- Rejected applications show rejection reason
- Pending applications show "under review" message

---

## 🧪 Testing

### Manual Test Flow

1. **Seed Database**:
   ```bash
   cd /app && node scripts/seed-admin-accounts.js
   cd /app && node scripts/seed-customer-accounts.js
   ```

2. **Login as Customer** (`customer1@techstart.com` / `Customer123!@#`):
   - Go to `/customer/policies`
   - Click "New Application"
   - Select a product and submit
   - Note the Application Number

3. **Login as Admin** (`admin1@insureinfra.com` / `Admin123!@#`):
   - Go to `/admin/underwriting`
   - Find the application you just submitted
   - Drag it to "Approved" or "Rejected" column
   - Add notes if rejecting

4. **Login as Customer Again**:
   - Go to `/customer/policies`
   - See the updated status with badge
   - See application number
   - See underwriter notes (if rejected)

### Automated Test

```bash
cd /app && node test-approval-flow.js
```

**This test verifies:**
- ✅ Applications exist in database
- ✅ Status can be updated
- ✅ Updates persist to database
- ✅ Customer view mapping is correct
- ✅ Application numbers are preserved

**Sample Output:**
```
🧪 TESTING ADMIN APPROVAL → CUSTOMER VIEW FLOW

📋 Current Applications:
1. Application: APP-1765692230910-A7JRWR
   Status: new → Updated to: approved

👤 Customer View Mapping:
   Approved (Active): 1 application(s)
   Pending (Under Review): 2 application(s)
   
✅ Real-time synchronization verified!
```

---

## 🔐 Security & Access Control

### Admin Access (`/admin/underwriting`)
- Can view ALL applications from ALL customers
- Can update any application status
- Can add underwriter notes
- Protected by middleware (requires `role: 'admin'`)

### Customer Access (`/customer/policies`)
- Can view ONLY their own applications
- Cannot modify status (read-only)
- Can see underwriter notes
- Protected by middleware (requires `role: 'customer'`)

---

## 📝 API Reference

### Admin Endpoints

**Get All Applications**
```http
GET /api/admin/applications
Authorization: Required (Admin role)
Response: Array of all applications
```

**Update Application Status**
```http
PATCH /api/admin/applications/:id
Authorization: Required (Admin role)
Content-Type: application/json

Body:
{
  "status": "approved",
  "underwriterNotes": "Optional notes...",
  "actualPremium": 800
}

Response: Updated application object
```

### Customer Endpoints

**Get My Policies/Applications**
```http
GET /api/customer/policies
Authorization: Required (Customer role)
Response: Array of user's applications with status
```

---

## 🎨 UI Components

### Admin Underwriting Page
- **File**: `/app/app/admin/underwriting/page.js`
- **Component**: Kanban board with drag-and-drop
- **Features**: 
  - Status columns
  - Drag to update status
  - Application detail dialog

### Customer Policies Page
- **File**: `/app/app/customer/policies/page.js`
- **Component**: Grid of policy cards
- **Features**:
  - Status badges with colors
  - Application numbers
  - Underwriter notes display
  - Date formatting
  - Conditional buttons (Download for approved, etc.)

---

## 🚀 Next Steps

### Possible Enhancements:
1. **Real-time Notifications**: WebSocket to notify customer instantly when status changes
2. **Email Notifications**: Send email when application is approved/rejected
3. **Appeal Process**: Allow customer to appeal rejected applications
4. **Document Upload**: Allow customer to provide additional documents for "info_required" status
5. **Status History**: Track all status changes with timestamps
6. **Admin Assignment**: Assign specific underwriters to applications

---

## 📚 Related Documentation

- **Data Flow**: See `/app/DATA_FLOW_DIAGRAM.md`
- **Account Credentials**: See `/app/ACCOUNTS.md`
- **Testing Scripts**: 
  - `/app/test-data-flow.js`
  - `/app/test-approval-flow.js`

---

**Last Updated**: December 14, 2024  
**System**: Vandage v1.0  
**Database**: MongoDB (insureinfra)  
**Collection**: applications (shared by admin and customer)
