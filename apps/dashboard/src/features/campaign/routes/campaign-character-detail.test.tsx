import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'

import { renderWithProviders } from '@/test/render'
import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '@/features/character'
import { buildCharacterDetailViewModel } from '@/features/character'
import { SAMPLE_PC } from '@/features/character'

import { CampaignCharacterDetail } from './campaign-character-detail'

vi.mock('../hooks/use-campaign-character-detail')
vi.mock('../hooks/use-campaigns')
vi.mock('../hooks/use-campaign-character-navigation-context')
vi.mock('@/features/character', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/character')>()
  return {
    ...actual,
    CharacterOrganizationMembershipsContainer: () => null,
  }
})

import { useCampaignCharacterDetail as useCampaignCharacterDetailFn } from '../hooks/use-campaign-character-detail'
import { useCampaigns as useCampaignsFn } from '../hooks/use-campaigns'
import { useCampaignCharacterNavigationContext as useCampaignCharacterNavigationContextFn } from '../hooks/use-campaign-character-navigation-context'
import { ROUTES } from '@/app/routes'
import { CAMPAIGN_CHARACTER_NAV_LABELS } from '../lib/build-campaign-character-navigation-context'

const useCampaignCharacterDetail = vi.mocked(useCampaignCharacterDetailFn)
const useCampaigns = vi.mocked(useCampaignsFn)
const useCampaignCharacterNavigationContext = vi.mocked(useCampaignCharacterNavigationContextFn)

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
const viewModel = buildCharacterDetailViewModel({
  character: SAMPLE_PC,
  catalogIndex,
  rules: context.characterCreationRules,
  xpProgression: { entries: [{ level: 1, xpRequired: 0 }] },
})

describe('CampaignCharacterDetail', () => {
  beforeEach(() => {
    useCampaignCharacterDetail.mockReset()
    useCampaigns.mockReset()
    useCampaignCharacterNavigationContext.mockReset()

    useCampaigns.mockReturnValue({
      data: [{ id: 'camp-1', identity: { name: 'Test Campaign' } }],
    } as ReturnType<typeof useCampaigns>)

    useCampaignCharacterNavigationContext.mockReturnValue({
      nav: {
        showCharactersNav: true,
        label: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
        href: ROUTES.campaign.characters.list('camp-1'),
        mode: 'list',
        activeSection: 'characters',
      },
      list: {
        pageTitle: CAMPAIGN_CHARACTER_NAV_LABELS.myCharacter,
        emptyState: 'no_controlled_character',
      },
    })
  })

  it('renders the campaign character sheet for authorized viewers', () => {
    useCampaignCharacterDetail.mockReturnValue({
      campaignCharacter: {
        character: SAMPLE_PC,
        capabilities: { canEdit: false, canManage: false, canDelete: false },
        participation: { roster: { status: 'active' } },
      },
      viewModel,
      organizationReferences: [],
      locationReferences: [],
      isPending: false,
      isError: false,
      errorLabel: undefined,
    })

    renderWithProviders(
      <Routes>
        <Route
          path="/campaigns/:campaignId/characters/:characterId"
          element={<CampaignCharacterDetail />}
        />
      </Routes>,
      { initialEntries: ['/campaigns/camp-1/characters/char-sample-1'] },
    )

    expect(screen.getByRole('heading', { name: viewModel.identity.name })).toBeInTheDocument()
    expect(screen.getByText('Roster: Active')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('shows delete for owners via campaign capabilities', () => {
    useCampaignCharacterDetail.mockReturnValue({
      campaignCharacter: {
        character: SAMPLE_PC,
        capabilities: { canEdit: true, canManage: false, canDelete: true },
        participation: { roster: { status: 'active' } },
      },
      viewModel,
      organizationReferences: [],
      locationReferences: [],
      isPending: false,
      isError: false,
      errorLabel: undefined,
    })

    renderWithProviders(
      <Routes>
        <Route
          path="/campaigns/:campaignId/characters/:characterId"
          element={<CampaignCharacterDetail />}
        />
      </Routes>,
      { initialEntries: ['/campaigns/camp-1/characters/char-sample-1'] },
    )

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('shows campaign permission errors from the detail hook', () => {
    useCampaignCharacterDetail.mockReturnValue({
      campaignCharacter: undefined,
      viewModel: null,
      organizationReferences: undefined,
      locationReferences: undefined,
      isPending: false,
      isError: true,
      errorLabel: 'You do not have permission to view this character.',
    })

    renderWithProviders(
      <Routes>
        <Route
          path="/campaigns/:campaignId/characters/:characterId"
          element={<CampaignCharacterDetail />}
        />
      </Routes>,
      { initialEntries: ['/campaigns/camp-1/characters/char-sample-1'] },
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'You do not have permission to view this character.',
    )
    expect(screen.getByRole('link', { name: 'Back to My Character' })).toHaveAttribute(
      'href',
      ROUTES.campaign.characters.list('camp-1'),
    )
  })
})
