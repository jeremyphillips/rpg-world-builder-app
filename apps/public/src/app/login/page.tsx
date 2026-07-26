import type { Metadata } from 'next'
import { APP_NAME } from '@rpg/contracts'

import { LoginPageClient } from '@/features/auth/components/login-page.client'

export const metadata: Metadata = {
  title: `Log in - ${APP_NAME}`,
}

export default function LoginPage() {
  return <LoginPageClient />
}
