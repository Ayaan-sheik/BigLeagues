import { getUserByEmail, verifyPassword } from './lib/auth.js'

async function testAuth() {
  try {
    console.log('Testing database connection and authentication...')
    
    const user = await getUserByEmail('admin1@insureinfra.com')
    console.log('User found:', user ? 'Yes' : 'No')
    
    if (user) {
      console.log('User role:', user.role)
      console.log('User ID:', user.id)
      console.log('Password hash exists:', user.passwordHash ? 'Yes' : 'No')
      
      const isValid = await verifyPassword('Admin123!@#', user.passwordHash)
      console.log('Password valid:', isValid)
    }
  } catch (error) {
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
  }
}

testAuth()