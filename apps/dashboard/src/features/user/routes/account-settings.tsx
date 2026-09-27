import { Heading } from '@rpg/ui'

import { PageShell } from '@/components/layout/page/page-shell'
import { ChangePasswordSection } from '../components/change-password-section'
import { ProfileSection } from '../components/profile-section'

export function AccountSettings() {
  return (
    <PageShell width="narrow" rhythm="loose">
      <Heading variant="page" as="h1">
        Account Settings
      </Heading>
      <ProfileSection />
      <hr className="border-border" />
      <ChangePasswordSection />
    </PageShell>
  )
}
