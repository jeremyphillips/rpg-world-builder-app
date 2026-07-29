import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/routes'

import { isSidebarNavItemActive, sectionHasActiveItem } from './section-has-active-item'
import type { SidebarNavSection } from './sidebar-nav-model'

const campaignId = 'camp_1'

describe('isSidebarNavItemActive', () => {
  it('uses end matching for index routes', () => {
    const item = {
      id: 'overview',
      label: 'Overview',
      href: ROUTES.campaign.detail(campaignId),
      end: true,
    }

    expect(isSidebarNavItemActive(`/campaigns/${campaignId}`, item)).toBe(true)
    expect(isSidebarNavItemActive(`/campaigns/${campaignId}/sessions`, item)).toBe(false)
  })

  it('uses prefix matching for section routes', () => {
    const item = {
      id: 'spells',
      label: 'Spells',
      href: ROUTES.content.spells.overview(campaignId),
    }

    expect(isSidebarNavItemActive(`/campaigns/${campaignId}/spells`, item)).toBe(true)
    expect(isSidebarNavItemActive(`/campaigns/${campaignId}/spells/fireball`, item)).toBe(true)
    expect(isSidebarNavItemActive(`/campaigns/${campaignId}/feats`, item)).toBe(false)
  })

  it('delegates to custom matchers', () => {
    const item = {
      id: 'characters',
      label: 'Characters',
      href: ROUTES.campaign.characters.list(campaignId),
      isActive: (pathname: string) => pathname.includes('/characters'),
    }

    expect(isSidebarNavItemActive(`/campaigns/${campaignId}/characters/abc`, item)).toBe(true)
  })
})

describe('sectionHasActiveItem', () => {
  const section: SidebarNavSection = {
    id: 'gameLibrary',
    label: 'Game Library',
    collapsible: true,
    items: [
      {
        id: 'spells',
        label: 'Spells',
        href: ROUTES.content.spells.overview(campaignId),
      },
    ],
  }

  it('returns true when any item in the section is active', () => {
    expect(sectionHasActiveItem(`/campaigns/${campaignId}/spells`, section)).toBe(true)
    expect(sectionHasActiveItem(`/campaigns/${campaignId}/npcs`, section)).toBe(false)
  })
})
