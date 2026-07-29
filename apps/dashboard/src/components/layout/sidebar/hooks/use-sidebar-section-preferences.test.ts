/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { ROUTES } from '@/app/routes'
import type { CampaignCharacterNavModel } from '@/features/campaign'

import { buildCampaignSidebarSections } from '../lib/build-campaign-sidebar-sections'
import { SIDEBAR_PREFERENCES_KEY } from '../lib/sidebar-preferences'
import { useSidebarSectionPreferences } from './use-sidebar-section-preferences'

const campaignId = 'camp_1'

const characterNav: CampaignCharacterNavModel = {
  showCharactersNav: true,
  label: 'Characters',
  href: ROUTES.campaign.characters.list(campaignId),
  mode: 'list',
  activeSection: 'characters',
}

describe('useSidebarSectionPreferences', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('forces a stored-collapsed section open when it contains the active route', () => {
    localStorage.setItem(
      SIDEBAR_PREFERENCES_KEY,
      JSON.stringify({ version: 1, expandedSections: { gameLibrary: false } }),
    )

    const sections = buildCampaignSidebarSections({
      campaignId,
      canManageCampaign: false,
      isElevatedPlatformRole: false,
      characterNav,
    })
    const gameLibrary = sections.find((section) => section.id === 'gameLibrary')!

    const { result } = renderHook(() => useSidebarSectionPreferences())

    expect(result.current.getSectionExpanded(gameLibrary, `/campaigns/${campaignId}/spells`)).toBe(
      true,
    )
  })

  it('persists user toggles without overwriting stored preference during forced open', () => {
    const sections = buildCampaignSidebarSections({
      campaignId,
      canManageCampaign: false,
      isElevatedPlatformRole: false,
      characterNav,
    })
    const gameLibrary = sections.find((section) => section.id === 'gameLibrary')!

    const { result } = renderHook(() => useSidebarSectionPreferences())

    act(() => {
      result.current.setSectionExpanded('gameLibrary', false)
    })

    expect(result.current.getSectionExpanded(gameLibrary, `/campaigns/${campaignId}/spells`)).toBe(
      true,
    )

    expect(JSON.parse(localStorage.getItem(SIDEBAR_PREFERENCES_KEY)!)).toEqual({
      version: 1,
      expandedSections: { gameLibrary: false },
    })
  })

  it('collapses a stored-collapsed section when no route inside is active', () => {
    localStorage.setItem(
      SIDEBAR_PREFERENCES_KEY,
      JSON.stringify({ version: 1, expandedSections: { gameLibrary: false } }),
    )

    const sections = buildCampaignSidebarSections({
      campaignId,
      canManageCampaign: false,
      isElevatedPlatformRole: false,
      characterNav,
    })
    const gameLibrary = sections.find((section) => section.id === 'gameLibrary')!

    const { result } = renderHook(() => useSidebarSectionPreferences())

    expect(result.current.getSectionExpanded(gameLibrary, `/campaigns/${campaignId}/npcs`)).toBe(
      false,
    )
  })

  it('collapses after navigation away from the active route when stored collapsed', () => {
    const sections = buildCampaignSidebarSections({
      campaignId,
      canManageCampaign: false,
      isElevatedPlatformRole: false,
      characterNav,
    })
    const gameLibrary = sections.find((section) => section.id === 'gameLibrary')!

    const { result } = renderHook(() => useSidebarSectionPreferences())

    act(() => {
      result.current.setSectionExpanded('gameLibrary', false)
    })

    expect(result.current.getSectionExpanded(gameLibrary, `/campaigns/${campaignId}/spells`)).toBe(
      true,
    )

    expect(result.current.getSectionExpanded(gameLibrary, `/campaigns/${campaignId}/npcs`)).toBe(
      false,
    )
  })
})
