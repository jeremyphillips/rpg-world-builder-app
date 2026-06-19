import { Heading } from '@rpg/ui'

import { ProfileSection } from '@/features/user/components/profile-section'
import { ChangePasswordSection } from '@/features/user/components/change-password-section'

export function AccountSettings() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Heading variant="page" as="h2">
        Account Settings
      </Heading>
      <ProfileSection />
      <hr className="border-border" />
      <ChangePasswordSection />
    </div>
  )
}
