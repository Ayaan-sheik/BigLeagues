import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider } from '@/components/providers/SessionProvider'

export const metadata = {
  title: 'Vandage — Embedded Insurance Orchestration',
  description:
    'Protect your startup from product failures, founder risk, and warranty losses — with per-transaction premium recovery.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
