import { Heading } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/page/narrow-page'
import { ChangePasswordSection } from '../components/change-password-section'
import { ProfileSection } from '../components/profile-section'

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
