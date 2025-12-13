'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LogoutButton({ variant = 'ghost', className = '' }) {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )
}
