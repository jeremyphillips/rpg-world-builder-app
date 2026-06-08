import { NavSection } from '@rpg/ui'

import { useIsElevatedPlatformRole } from '@/features/auth'
import { NavItem } from './nav-item'

export function AdminNavSection() {
  const isElevated = useIsElevatedPlatformRole()

  if (!isElevated) return null

  return (
    <NavSection label="Admin">
      <NavItem to="/admin/users" label="Users" />
      <NavItem to="/admin/settings" label="Admin Settings" />
    </NavSection>
  )
}
