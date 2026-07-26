import type { Metadata } from 'next'

import { SignupPageClient } from '@/features/auth/components/signup-page.client'

export const metadata: Metadata = {
  title: 'Sign up - RPG World Builder',
}

export default function SignupPage() {
  return <SignupPageClient />
}
