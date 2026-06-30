import { NavSection } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { NavItem } from './nav-item'
import { CampaignNavSection } from './campaign-nav-section'
import { ManageNavSection } from './manage-nav-section'
import { AdminNavSection } from './admin-nav-section'

export function SidebarNav() {
  return (
    <nav className="flex flex-col overflow-y-auto px-3 pb-4" aria-label="Primary">
      <NavSection label="Main">
        <NavItem to={ROUTES.home} label="Dashboard" end />
        <NavItem to={ROUTES.characters.list} label="Characters" />
      </NavSection>
      <CampaignNavSection />
      <ManageNavSection />
      <AdminNavSection />
    </nav>
  )
}
