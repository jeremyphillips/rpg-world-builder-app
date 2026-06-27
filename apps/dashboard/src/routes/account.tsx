import { Heading } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/narrow-page'
import { ProfileSection } from '@/features/user/components/profile-section'
import { ChangePasswordSection } from '@/features/user/components/change-password-section'

export function AccountSettings() {
  return (
    <NarrowPage spacing="loose">
      <Heading variant="page" as="h1">
        Account Settings
      </Heading>
      <ProfileSection />
      <hr className="border-border" />
      <ChangePasswordSection />
    </NarrowPage>
  )
}
