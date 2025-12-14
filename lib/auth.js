import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from './db.js'

// Hash password with bcrypt
export async function hashPassword(password) {
  return await bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

// Create user in database
export async function createUser(email, password, name, role = 'customer') {
  const db = await getDb()
  
  // Check if user exists
  const existingUser = await db.collection('users').findOne({ email })
  if (existingUser) {
    throw new Error('User already exists')
  }
  
  const hashedPassword = await hashPassword(password)
  
  const user = {
    id: uuidv4(),
    email,
    name,
    passwordHash: hashedPassword,
    role,
    permissions: [],
    twoFactorEnabled: false,
    profileCompleted: false,
    onboardingStep: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null,
  }
  
  await db.collection('users').insertOne(user)
  
  // Create audit log
  await createAuditLog(user.id, 'USER_REGISTERED', null, null)
  
  return user
}

// Find user by email
export async function getUserByEmail(email) {
  const db = await getDb()
  return await db.collection('users').findOne({ email })
}

// Find user by ID
export async function getUserById(id) {
  const db = await getDb()
  return await db.collection('users').findOne({ id })
}

// Update user last login
export async function updateLastLogin(userId) {
  const db = await getDb()
  await db.collection('users').updateOne(
    { id: userId },
    { $set: { lastLogin: new Date() } }
  )
}

// Create audit log
export async function createAuditLog(userId, action, ip, userAgent) {
  const db = await getDb()
  
  const log = {
    id: uuidv4(),
    userId,
    action,
    ip,
    userAgent,
    timestamp: new Date(),
  }
  
  await db.collection('audit_logs').insertOne(log)
  return log
}

// Create password reset token
export async function createPasswordResetToken(email) {
  const db = await getDb()
  const user = await getUserByEmail(email)
  
  if (!user) {
    throw new Error('User not found')
  }
  
  const token = uuidv4()
  const expiresAt = new Date(Date.now() + 3600000) // 1 hour
  
  // Delete old tokens
  await db.collection('password_reset_tokens').deleteMany({ userId: user.id })
  
  // Create new token
  await db.collection('password_reset_tokens').insertOne({
    id: uuidv4(),
    userId: user.id,
    token,
    expiresAt,
    used: false,
    createdAt: new Date(),
  })
  
  return { token, user }
}

// Verify and use password reset token
export async function verifyPasswordResetToken(token) {
  const db = await getDb()
  
  const resetToken = await db.collection('password_reset_tokens').findOne({
    token,
    used: false,
    expiresAt: { $gt: new Date() },
  })
  
  if (!resetToken) {
    throw new Error('Invalid or expired token')
  }
  
  return resetToken
}

// Reset password
export async function resetPassword(token, newPassword) {
  const db = await getDb()
  
  const resetToken = await verifyPasswordResetToken(token)
  const hashedPassword = await hashPassword(newPassword)
  
  // Update password
  await db.collection('users').updateOne(
    { id: resetToken.userId },
    { $set: { passwordHash: hashedPassword, updatedAt: new Date() } }
  )
  
  // Mark token as used
  await db.collection('password_reset_tokens').updateOne(
    { id: resetToken.id },
    { $set: { used: true } }
  )
  
  // Create audit log
  await createAuditLog(resetToken.userId, 'PASSWORD_RESET', null, null)
  
  return true
}

// Create or update Google user
export async function createOrUpdateGoogleUser(profile) {
  const db = await getDb()
  
  const existingUser = await db.collection('users').findOne({
    $or: [
      { email: profile.email },
      { googleId: profile.sub }
    ]
  })
  
  if (existingUser) {
    // Update existing user
    await db.collection('users').updateOne(
      { id: existingUser.id },
      {
        $set: {
          googleId: profile.sub,
          name: profile.name,
          image: profile.picture,
          updatedAt: new Date(),
        }
      }
    )
    
    return existingUser
  }
  
  // Create new user
  const user = {
    id: uuidv4(),
    email: profile.email,
    name: profile.name,
    image: profile.picture,
    googleId: profile.sub,
    role: 'customer',
    permissions: [],
    twoFactorEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date(),
  }
  
  await db.collection('users').insertOne(user)
  await createAuditLog(user.id, 'USER_REGISTERED_GOOGLE', null, null)
  
  return user
}
