import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/routes'
import type { CampaignCharacterNavModel } from '@/features/campaign'

import { buildCampaignSidebarSections } from './build-campaign-sidebar-sections'
import { buildGlobalSidebarSections } from './build-global-sidebar-sections'
import { contentIdentityIcon } from '@rpg/ui'

import { SIDEBAR_NAV_ICONS, type SidebarNavIconId } from './sidebar-nav-icons'

const campaignId = 'camp_1'

const managerCharacterNav: CampaignCharacterNavModel = {
  showCharactersNav: true,
  label: 'Characters',
  href: ROUTES.campaign.characters.list(campaignId),
  mode: 'list',
  activeSection: 'characters',
}

describe('SIDEBAR_NAV_ICONS', () => {
  it('reuses canonical content fallback icons for catalog nav items', () => {
    expect(SIDEBAR_NAV_ICONS.spells).toBe(contentIdentityIcon('spell'))
    expect(SIDEBAR_NAV_ICONS.characters).toBe(contentIdentityIcon('character'))
    expect(SIDEBAR_NAV_ICONS.classes).toBe(contentIdentityIcon('class'))
  })

  it('covers every nav item emitted by global and campaign builders', () => {
    const items = [
      ...buildGlobalSidebarSections({ isElevatedPlatformRole: true }).flatMap(
        (section) => section.items,
      ),
      ...buildCampaignSidebarSections({
        campaignId,
        canManageCampaign: true,
        isElevatedPlatformRole: true,
        characterNav: managerCharacterNav,
      }).flatMap((section) => section.items),
    ]

    for (const item of items) {
      expect(SIDEBAR_NAV_ICONS[item.id as SidebarNavIconId]).toBe(item.icon)
    }
  })
})
