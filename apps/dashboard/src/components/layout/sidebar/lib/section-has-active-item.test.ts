import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/routes'

import { matchSidebarNavHref } from './match-sidebar-nav-href'
import { sectionHasActiveItem } from './section-has-active-item'
import { sidebarNavItem } from './sidebar-nav-icons'
import type { CollapsibleSidebarNavSection } from './sidebar-nav-model'

const campaignId = 'camp_1'

describe('matchSidebarNavHref', () => {
  it('uses end matching for index routes', () => {
    const item = sidebarNavItem({
      id: 'overview',
      label: 'Overview',
      href: ROUTES.campaign.detail(campaignId),
      end: true,
    })

    expect(matchSidebarNavHref(`/campaigns/${campaignId}`, item)).toBe(true)
    expect(matchSidebarNavHref(`/campaigns/${campaignId}/sessions`, item)).toBe(false)
  })

  it('uses prefix matching for section routes', () => {
    const item = sidebarNavItem({
      id: 'spells',
      label: 'Spells',
      href: ROUTES.content.spells.overview(campaignId),
    })

    expect(matchSidebarNavHref(`/campaigns/${campaignId}/spells`, item)).toBe(true)
    expect(matchSidebarNavHref(`/campaigns/${campaignId}/spells/fireball`, item)).toBe(true)
    expect(matchSidebarNavHref(`/campaigns/${campaignId}/feats`, item)).toBe(false)
  })

  it('delegates to custom matchers', () => {
    const item = sidebarNavItem({
      id: 'characters',
      label: 'Characters',
      href: ROUTES.campaign.characters.list(campaignId),
      isActive: (pathname: string) => pathname.includes('/characters'),
    })

    expect(matchSidebarNavHref(`/campaigns/${campaignId}/characters/abc`, item)).toBe(true)
  })
})

describe('sectionHasActiveItem', () => {
  const section: CollapsibleSidebarNavSection = {
    id: 'gameLibrary',
    label: 'Game Library',
    collapsible: true,
    items: [
      sidebarNavItem({
        id: 'spells',
        label: 'Spells',
        href: ROUTES.content.spells.overview(campaignId),
      }),
    ],
  }

  it('returns true when any item in the section is active', () => {
    expect(sectionHasActiveItem(`/campaigns/${campaignId}/spells`, section)).toBe(true)
    expect(sectionHasActiveItem(`/campaigns/${campaignId}/npcs`, section)).toBe(false)
  })
})
