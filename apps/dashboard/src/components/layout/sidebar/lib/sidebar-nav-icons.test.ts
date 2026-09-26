import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/routes'
import type { CampaignCharacterNavModel } from '@/features/campaign'

import { buildCampaignSidebarSections } from './build-campaign-sidebar-sections'
import { buildGlobalSidebarSections } from './build-global-sidebar-sections'
import { CONTENT_DISPLAY_FALLBACK_ICONS } from '@rpg/ui'

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
    expect(SIDEBAR_NAV_ICONS.spells).toBe(CONTENT_DISPLAY_FALLBACK_ICONS.spell)
    expect(SIDEBAR_NAV_ICONS.characters).toBe(CONTENT_DISPLAY_FALLBACK_ICONS.character)
    expect(SIDEBAR_NAV_ICONS.classes).toBe(CONTENT_DISPLAY_FALLBACK_ICONS.class)
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
