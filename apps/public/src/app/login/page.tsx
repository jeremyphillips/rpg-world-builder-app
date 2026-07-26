import type { Metadata } from 'next'

import { LoginPageClient } from '@/features/auth/components/login-page.client'

export const metadata: Metadata = {
  title: 'Log in - RPG World Builder',
}

export default function LoginPage() {
  return <LoginPageClient />
}
