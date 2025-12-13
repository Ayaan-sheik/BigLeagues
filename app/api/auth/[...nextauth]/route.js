import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByEmail, verifyPassword, updateLastLogin, createAuditLog, createOrUpdateGoogleUser } from '@/lib/auth'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'placeholder-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder-google-client-secret',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password')
        }

        const user = await getUserByEmail(credentials.email)

        if (!user || !user.passwordHash) {
          throw new Error('Invalid email or password')
        }

        const isValid = await verifyPassword(credentials.password, user.passwordHash)

        if (!isValid) {
          throw new Error('Invalid email or password')
        }

        await updateLastLogin(user.id)
        await createAuditLog(user.id, 'LOGIN_SUCCESS', null, null)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        try {
          const dbUser = await createOrUpdateGoogleUser(profile)
          user.id = dbUser.id
          user.role = dbUser.role
          return true
        } catch (error) {
          console.error('Error creating/updating Google user:', error)
          return false
        }
      }
      return true
    },
    
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.profileCompleted = user.profileCompleted || false
        token.onboardingStep = user.onboardingStep || 0
      }
      
      // Refresh profile status from database if needed
      if (trigger === 'update') {
        const { getUserById } = await import('@/lib/auth')
        const dbUser = await getUserById(token.id)
        if (dbUser) {
          token.profileCompleted = dbUser.profileCompleted || false
          token.onboardingStep = dbUser.onboardingStep || 0
        }
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.profileCompleted = token.profileCompleted
        session.user.onboardingStep = token.onboardingStep
      }
      return session
    },
    
    async redirect({ url, baseUrl }) {
      // Redirect to appropriate page after login
      if (url.includes('/auth/login') || url === baseUrl) {
        // This will be handled by middleware based on profileCompleted
        return `${baseUrl}/dashboard`
      }
      return url
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET || 'this-is-a-placeholder-secret-please-change-in-production',
  
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }
