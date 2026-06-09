import { ProfileSection } from '@/features/user/components/profile-section'
import { ChangePasswordSection } from '@/features/user/components/change-password-section'

export function AccountSettings() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <h2 className="text-2xl font-semibold tracking-tight">Account Settings</h2>
      <ProfileSection />
      <hr className="border-border" />
      <ChangePasswordSection />
    </div>
  )
}
