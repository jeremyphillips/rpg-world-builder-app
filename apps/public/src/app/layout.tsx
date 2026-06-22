import type { Metadata } from 'next'
import { Inter, Lora } from 'next/font/google'

import { AppProviders } from './providers.client'
import './globals.css'

// Exposed as CSS variables consumed by the @rpg/ui --font-sans / --font-display tokens.
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const lora = Lora({ subsets: ['latin'], variable: '--font-heading' })

export const metadata: Metadata = {
  title: 'RPG World Builder',
  description: 'Campaign tooling for tabletop RPGs - author worlds and run sessions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
