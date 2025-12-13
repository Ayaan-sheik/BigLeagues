'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Shield,
  FileText,
  CreditCard,
  BarChart3,
  Plug,
  Settings,
  LifeBuoy,
  Receipt,
  Menu,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navigation = [
  { name: 'Dashboard Home', href: '/customer', icon: LayoutDashboard },
  { name: 'My Policies', href: '/customer/policies', icon: Shield },
  { name: 'Transactions', href: '/customer/transactions', icon: Receipt },
  { name: 'Claims', href: '/customer/claims', icon: FileText },
  { name: 'Payments & Billing', href: '/customer/payments', icon: CreditCard },
  { name: 'Integration & API', href: '/customer/integration', icon: Plug },
  { name: 'Analytics', href: '/customer/analytics', icon: BarChart3 },
  { name: 'Profile & Settings', href: '/customer/settings', icon: Settings },
  { name: 'Support', href: '/customer/support', icon: LifeBuoy },
]

function SidebarContent({ closeMobile }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-6 bg-[#37322F]">
        <Link href="/" className="flex items-center gap-2 font-semibold text-[#F7F5F3]">
          <Shield className="h-6 w-6 text-orange-500" />
          <span className="text-lg">InsureInfra</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/customer' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobile}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-[#37322F] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 border border-blue-200">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <div className="text-xs">
            <p className="font-medium text-blue-900">Integration Active</p>
            <p className="text-blue-700">API connected</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CustomerLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#F7F5F3]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-white lg:block">
        <SidebarContent closeMobile={() => {}} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="lg:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon" className="bg-white">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent closeMobile={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
