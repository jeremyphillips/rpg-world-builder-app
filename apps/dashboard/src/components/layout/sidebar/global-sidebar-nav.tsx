import { NavSection } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { AdminNavSection } from './admin-nav-section'
import { NavItem } from './nav-item'

/** Global AppShell navigation — no campaign-scoped destinations. */
export function GlobalSidebarNav() {
  return (
    <>
      <NavSection label="Main">
        <NavItem to={ROUTES.home} label="Dashboard" end />
        <NavItem to={ROUTES.campaign.list} label="Campaigns" />
        <NavItem to={ROUTES.characters.list} label="Characters" />
      </NavSection>
      <NavSection label="Tools">
        <NavItem to={ROUTES.nameGenerator} label="Name Generator" />
      </NavSection>
      <AdminNavSection />
    </>
  )
}
