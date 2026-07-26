import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { APP_NAME } from '@rpg/contracts'

import { AppProviders } from './providers.client'
import './globals.css'

// Exposed as a CSS variable consumed by the @rpg/ui --font-sans / --font-display tokens.
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Campaign tooling for tabletop RPGs - author worlds and run sessions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
