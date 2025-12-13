import './globals.css'
import Providers from './providers'

export const metadata = {
  title: 'InsureInfra — Embedded Insurance Orchestration',
  description:
    'Protect your startup from product failures, founder risk, and warranty losses — with per-transaction premium recovery.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
