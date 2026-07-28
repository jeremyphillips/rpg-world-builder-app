import type { Metadata } from 'next'
import { APP_NAME } from '@rpg/contracts'

import { SignupPageClient } from '@/features/auth/components/signup-page.client'

export const metadata: Metadata = {
  title: `Sign up - ${APP_NAME}`,
}

export default function SignupPage() {
  return <SignupPageClient />
}
