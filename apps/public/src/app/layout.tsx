import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'RPG World Builder',
  description: 'Campaign tooling for tabletop RPGs - author worlds and run sessions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-foreground antialiased">{children}</body>
    </html>
  )
}
