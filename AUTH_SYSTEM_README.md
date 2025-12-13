# InsureInfra Authentication System

## 🎉 Complete Authentication System Implemented

A comprehensive authentication system with stunning liquid glass morphism design.

---

## 🚀 Features Implemented

### Core Authentication
- ✅ **NextAuth.js v4** with JWT strategy
- ✅ **Google OAuth** integration (placeholder credentials)
- ✅ **Email/Password** authentication with bcrypt (12 rounds)
- ✅ **Session Management** (30-day JWT tokens)
- ✅ **Role-Based Access Control** (customer/admin)
- ✅ **Password Reset Flow** with secure tokens
- ✅ **Audit Logging** for all auth actions

### UI Pages (Liquid Glass Morphism Design)
1. **Login Page** (`/auth/login`)
   - Google Sign-In button
   - Email/password form
   - Remember me checkbox
   - Password visibility toggle
   - Forgot password link
   
2. **Register Page** (`/auth/register`)
   - Google Sign-Up button
   - Registration form with validation
   - Password strength indicator (Weak/Medium/Strong)
   - Terms & conditions checkbox
   - Auto-login after registration
   
3. **Forgot Password** (`/auth/forgot-password`)
   - Email submission form
   - Success confirmation
   - Resend countdown timer
   - Development mode reset link display
   
4. **Reset Password** (`/auth/reset-password`)
   - Token validation
   - New password with strength indicator
   - Confirm password matching
   - Auto-redirect to login after success
   
5. **Error Page** (`/auth/error`)
   - Friendly error messages
   - Retry and back to home options
   
6. **Dashboard** (`/dashboard`)
   - Protected route requiring authentication
   - User profile information
   - Account details
   - Sign out functionality

### Security Features
- ✅ Password hashing with bcrypt (cost factor: 12)
- ✅ JWT tokens with secure secrets
- ✅ HTTP-only cookies
- ✅ CSRF protection (NextAuth built-in)
- ✅ Route protection middleware
- ✅ Input validation with Zod
- ✅ Audit trail for all auth events

---

## 📁 File Structure

```
/app
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.js    # NextAuth configuration
│   │       ├── register/route.js          # User registration endpoint
│   │       ├── forgot-password/route.js   # Password reset request
│   │       └── reset-password/route.js    # Password reset with token
│   ├── auth/
│   │   ├── login/page.js                  # Login page
│   │   ├── register/page.js               # Registration page
│   │   ├── forgot-password/page.js        # Forgot password page
│   │   ├── reset-password/page.js         # Reset password page
│   │   └── error/page.js                  # Auth error page
│   ├── dashboard/page.js                   # Protected dashboard
│   ├── layout.js                           # Root layout with SessionProvider
│   ├── page.js                             # Landing page (connected to auth)
│   └── providers.js                        # NextAuth SessionProvider wrapper
├── lib/
│   ├── auth.js                             # Auth utilities (bcrypt, user management)
│   └── db.js                               # MongoDB connection
├── middleware.js                            # Route protection middleware
└── .env                                     # Environment variables
```

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  id: "uuid-v4",                    // UUID (not MongoDB ObjectId)
  email: "user@example.com",        // Unique, indexed
  name: "John Doe",                 // Optional
  passwordHash: "$2a$12...",        // bcrypt hash (for email/password users)
  googleId: "google-oauth-id",      // Optional (for Google OAuth users)
  image: "https://...",             // Optional (from Google profile)
  role: "customer" | "admin",       // Role-based access control
  permissions: [],                   // Array of permission strings
  twoFactorEnabled: false,           // Future: 2FA support
  twoFactorSecret: null,             // Future: 2FA secret
  lastLogin: Date,                   // Last successful login
  createdAt: Date,                   // Account creation timestamp
  updatedAt: Date                    // Last update timestamp
}
```

### Audit Logs Collection
```javascript
{
  id: "uuid-v4",
  userId: "user-uuid",
  action: "LOGIN_SUCCESS" | "USER_REGISTERED" | "PASSWORD_RESET" | ...,
  ip: "192.168.1.1",                // Optional
  userAgent: "Mozilla/5.0...",      // Optional
  timestamp: Date
}
```

### Password Reset Tokens Collection
```javascript
{
  id: "uuid-v4",
  userId: "user-uuid",
  token: "uuid-v4",                  // Reset token
  expiresAt: Date,                   // 1 hour from creation
  used: false,                       // Prevents token reuse
  createdAt: Date
}
```

---

## 🔧 Configuration

### Environment Variables (`.env`)
```env
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=your_database_name

# Next.js
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key-change-in-production

# Google OAuth (Replace with real credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`
7. Restart Next.js server

---

## 🎨 Design System

### Liquid Glass Morphism Style

All authentication pages use a consistent liquid glass (glassmorphism) design:

- **Background**: Dark gradient (`slate-900` → `slate-800`)
- **Glass Cards**: Semi-transparent with backdrop blur
  - `bg-slate-800/70 backdrop-blur-xl`
  - `border border-white/10`
  - `shadow-2xl shadow-black/50`
- **Input Fields**: Frosted glass effect
  - `bg-slate-900/60 backdrop-blur-sm`
  - `border border-white/15`
- **Buttons**: Gradient with glow effect
  - Primary: `bg-gradient-to-r from-blue-500 to-purple-500`
  - `shadow-lg shadow-blue-500/25`
- **Animated Background**: Pulsing gradient orbs
- **Color Palette**:
  - Blue: `#3b82f6`
  - Purple: `#9333ea`
  - Slate backgrounds: `#0f172a`, `#1e293b`
  - White overlays with low opacity

---

## 🔐 API Endpoints

### NextAuth Endpoints (Automatic)
- `GET/POST /api/auth/session` - Get/update session
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/csrf` - Get CSRF token
- `GET /api/auth/callback/:provider` - OAuth callbacks

### Custom Endpoints
- `POST /api/auth/register` - Register new user
  - Body: `{ name, email, password, role? }`
  - Returns: `{ message, user: { id, email, name, role } }`
  
- `POST /api/auth/forgot-password` - Request password reset
  - Body: `{ email }`
  - Returns: `{ message, resetLink? }` (resetLink only in dev mode)
  
- `POST /api/auth/reset-password` - Reset password with token
  - Body: `{ token, password }`
  - Returns: `{ message }`

---

## 🛡️ Route Protection

### Middleware Configuration

The middleware (`/middleware.js`) protects routes automatically:

- **Protected Routes**:
  - `/dashboard/*` - Requires authentication
  - `/admin/*` - Requires admin role
  
- **Redirect Logic**:
  - Unauthenticated users → `/auth/login`
  - Authenticated users on auth pages → `/dashboard`
  - Non-admin users on admin pages → `/dashboard`

### Using Session in Components

```javascript
import { useSession, signOut } from 'next-auth/react'

export default function Component() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Loading...</div>
  if (status === 'unauthenticated') return <div>Not logged in</div>
  
  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <p>Role: {session.user.role}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

---

## ✅ Testing Results

### Core Flows (All Working)
- ✅ User registration with email/password
- ✅ Auto-login after registration
- ✅ Login with email/password
- ✅ Session persistence (30 days)
- ✅ Dashboard access when authenticated
- ✅ Route protection redirects
- ✅ Logout and session clearing
- ✅ Landing page → Login flow

### UI/UX (All Working)
- ✅ Liquid glass morphism design on all pages
- ✅ Password strength indicator (Weak/Medium/Strong)
- ✅ Form validation with Zod
- ✅ Password visibility toggles
- ✅ Remember me checkbox
- ✅ Responsive design
- ✅ Smooth animations and transitions

### Known Limitations
- ⚠️ Google OAuth uses placeholder credentials (won't work until real credentials added)
- ⚠️ Email sending not implemented (password reset links shown in console/response in dev mode)
- ⚠️ 2FA not yet implemented (schema ready)

---

## 🚦 Next Steps (Optional Enhancements)

1. **Email Integration**
   - Add email service (SendGrid, AWS SES, Resend)
   - Send welcome emails on registration
   - Send password reset emails
   - Email verification flow

2. **Two-Factor Authentication**
   - Implement TOTP (Time-based OTP)
   - QR code generation for authenticator apps
   - Backup codes

3. **Additional OAuth Providers**
   - GitHub
   - Microsoft
   - LinkedIn

4. **Admin Dashboard**
   - User management interface
   - View audit logs
   - Role assignment
   - System monitoring

5. **Enhanced Security**
   - Rate limiting on auth endpoints
   - IP-based blocking
   - Suspicious activity detection
   - Session device management

6. **User Profile Management**
   - Edit profile information
   - Change password (authenticated users)
   - Upload profile picture
   - Account deletion

---

## 📝 Usage Examples

### Register a New User

1. Navigate to `/auth/register`
2. Fill in the form:
   - Full Name
   - Email
   - Password (must be 8+ characters)
   - Confirm Password
3. Check "Accept terms"
4. Click "Create Account"
5. Automatically redirected to dashboard

### Login Flow

1. Click "Start Integration" on landing page OR navigate to `/auth/login`
2. Enter email and password
3. Optionally check "Remember me"
4. Click "Sign In"
5. Redirected to dashboard

### Password Reset Flow

1. Click "Forgot password?" on login page
2. Enter your email
3. Click "Send Reset Link"
4. In development: Copy reset link from response/console
5. In production: Check email for reset link
6. Click link → redirected to reset password page
7. Enter new password
8. Click "Reset Password"
9. Redirected to login page

---

## 🐛 Troubleshooting

### "NEXTAUTH_URL" Warning
- Ensure `NEXTAUTH_URL` is set in `.env`
- Must match your deployment URL
- For local dev: `http://localhost:3000`

### Google OAuth Not Working
- Replace placeholder credentials in `.env`
- Verify redirect URIs in Google Cloud Console
- Restart Next.js server after changing `.env`

### Session Not Persisting
- Check browser cookies are enabled
- Verify `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again

### Database Connection Issues
- Verify `MONGO_URL` is correct
- Ensure MongoDB is running
- Check database name in connection string

---

## 📚 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js v4
- **Database**: MongoDB
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **Styling**: Tailwind CSS (Liquid Glass Morphism)
- **Icons**: Lucide React
- **Session**: JWT (HTTP-only cookies)

---

## 🎯 Summary

This authentication system provides:
- **Security**: Industry-standard practices (bcrypt, JWT, CSRF protection)
- **Flexibility**: Email/password + OAuth support
- **User Experience**: Beautiful liquid glass design with smooth flows
- **Scalability**: Ready for production with role-based access
- **Maintainability**: Well-structured code with clear separation of concerns

**Status**: Production-ready for core authentication flows. Optional enhancements available for advanced features.
