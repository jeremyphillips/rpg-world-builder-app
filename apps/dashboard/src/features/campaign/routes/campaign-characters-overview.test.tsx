import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'

import { renderWithProviders } from '@/test/render'
import { CAMPAIGN_CHARACTER_NAV_LABELS } from '../lib/build-campaign-character-navigation-context'

vi.mock('../hooks/use-campaign-character-navigation-context')
vi.mock('../hooks/use-campaign-characters')
vi.mock('../hooks/use-campaigns')
vi.mock('../../character/hooks/use-campaign-build-context')

import { useCampaignCharacterNavigationContext as useCampaignCharacterNavigationContextFn } from '../hooks/use-campaign-character-navigation-context'
import { useCampaignCharacters as useCampaignCharactersFn } from '../hooks/use-campaign-characters'
import { useCampaigns as useCampaignsFn } from '../hooks/use-campaigns'
import { useCampaignBuildContext as useCampaignBuildContextFn } from '@/features/character'
import { CampaignCharactersOverview } from './campaign-characters-overview'

const useCampaignCharacterNavigationContext = vi.mocked(useCampaignCharacterNavigationContextFn)
const useCampaignCharacters = vi.mocked(useCampaignCharactersFn)
const useCampaigns = vi.mocked(useCampaignsFn)
const useCampaignBuildContext = vi.mocked(useCampaignBuildContextFn)

describe('CampaignCharactersOverview', () => {
  beforeEach(() => {
    useCampaignCharacterNavigationContext.mockReset()
    useCampaignCharacters.mockReset()
    useCampaigns.mockReset()
    useCampaignBuildContext.mockReset()

    useCampaigns.mockReturnValue({
      data: [
        {
          id: 'camp_1',
          openControlledCharacterIds: [],
        },
      ],
    } as unknown as ReturnType<typeof useCampaigns>)

    useCampaignBuildContext.mockReturnValue({
      catalogIndex: {},
      isPending: false,
      isError: false,
      error: undefined,
    } as unknown as ReturnType<typeof useCampaignBuildContext>)

    useCampaignCharacters.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      error: undefined,
    } as unknown as ReturnType<typeof useCampaignCharacters>)
  })

  it('shows the no_controlled_character empty state copy', () => {
    useCampaignCharacterNavigationContext.mockReturnValue({
      nav: {
        showCharactersNav: true,
        label: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
        href: '/campaigns/camp_1/characters',
        mode: 'list',
        activeSection: 'characters',
      },
      list: {
        pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
        emptyState: 'no_controlled_character',
      },
    })

    renderWithProviders(
      <Routes>
        <Route path="/campaigns/:campaignId/characters" element={<CampaignCharactersOverview />} />
      </Routes>,
      { initialEntries: ['/campaigns/camp_1/characters'] },
    )

    expect(
      screen.getByRole('heading', { name: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter }),
    ).toBeInTheDocument()
    expect(screen.getByText('No character is currently assigned to you.')).toBeInTheDocument()
  })
})
