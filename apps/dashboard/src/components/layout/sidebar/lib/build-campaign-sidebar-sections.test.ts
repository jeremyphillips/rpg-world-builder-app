import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/routes'
import type { CampaignCharacterNavModel } from '@/features/campaign'
import { VISIBLE_SIDEBAR_CONTENT } from '@/features/homebrew'

import { buildCampaignSidebarSections } from './build-campaign-sidebar-sections'

const campaignId = 'camp_1'

const managerCharacterNav: CampaignCharacterNavModel = {
  showCharactersNav: true,
  label: 'Characters',
  href: ROUTES.campaign.characters.list(campaignId),
  mode: 'list',
  activeSection: 'characters',
}

const hiddenCharacterNav: CampaignCharacterNavModel = {
  showCharactersNav: false,
}

function buildSections(
  overrides: Partial<Parameters<typeof buildCampaignSidebarSections>[0]> = {},
) {
  return buildCampaignSidebarSections({
    campaignId,
    canManageCampaign: false,
    isElevatedPlatformRole: false,
    characterNav: managerCharacterNav,
    ...overrides,
  })
}

describe('buildCampaignSidebarSections', () => {
  it('organizes destinations into Campaign, World, and Game Library sections', () => {
    const sections = buildSections()

    expect(sections.map((section) => section.id)).toEqual(['campaign', 'world', 'gameLibrary'])

    const campaignItems = sections.find((section) => section.id === 'campaign')!.items
    expect(campaignItems.map((item) => item.label)).toEqual([
      'Overview',
      'Characters',
      'Sessions',
      'Messages',
    ])
    expect(campaignItems[0]).toMatchObject({
      href: ROUTES.campaign.detail(campaignId),
      end: true,
    })
    expect(campaignItems.at(-1)).toMatchObject({
      href: ROUTES.messages.listScoped(campaignId),
    })

    const worldItems = sections.find((section) => section.id === 'world')!.items
    expect(worldItems.map((item) => item.label)).toEqual(['NPCs', 'Organizations'])
    expect(worldItems[0]).toMatchObject({ href: ROUTES.campaign.npcs.list(campaignId) })

    const gameLibraryLabels = sections
      .find((section) => section.id === 'gameLibrary')!
      .items.map((item) => item.label)
    const expectedGameLibraryLabels = [
      ...VISIBLE_SIDEBAR_CONTENT.filter((entry) => entry.contentType !== 'organizations').map(
        (entry) => entry.label,
      ),
      'Game Terms',
      'Homebrew',
    ]
    expect(gameLibraryLabels).toEqual(expectedGameLibraryLabels)
    expect(gameLibraryLabels).not.toContain('Organizations')
  })

  it('links Equipment to the existing hub route', () => {
    const equipment = buildSections()
      .find((section) => section.id === 'gameLibrary')!
      .items.find((item) => item.id === 'equipment')

    expect(equipment).toMatchObject({ href: ROUTES.content.equipment.hub(campaignId) })
  })

  it('omits the characters item when viewer navigation is hidden', () => {
    const campaignItems = buildSections({ characterNav: hiddenCharacterNav })
      .find((section) => section.id === 'campaign')!
      .items.map((item) => item.label)

    expect(campaignItems).toEqual(['Overview', 'Sessions', 'Messages'])
  })

  it('includes Manage only when the viewer can manage the campaign', () => {
    expect(buildSections().some((section) => section.id === 'manage')).toBe(false)

    const manage = buildSections({ canManageCampaign: true }).find(
      (section) => section.id === 'manage',
    )
    expect(manage?.items[0]).toMatchObject({
      id: 'campaign-settings',
      label: 'Campaign Settings',
      href: ROUTES.campaign.settings(campaignId),
    })
  })

  it('includes Admin only for elevated platform roles', () => {
    expect(buildSections().some((section) => section.id === 'admin')).toBe(false)

    const admin = buildSections({ isElevatedPlatformRole: true }).find(
      (section) => section.id === 'admin',
    )
    expect(admin?.items.map((item) => item.label)).toEqual(['Users', 'Admin Settings'])
  })
})
