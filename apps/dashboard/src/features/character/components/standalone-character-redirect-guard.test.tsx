import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { renderWithProviders } from '@/test/render'

import { StandaloneCharacterRedirectGuard } from './standalone-character-redirect-guard'

vi.mock('../hooks/use-character')
vi.mock('../hooks/use-character-routing-context')
vi.mock('@/features/campaign', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    useCampaigns: vi.fn(),
  }
})

import { useCampaigns } from '@/features/campaign'
import { useCharacter as useCharacterFn } from '../hooks/use-character'
import { useCharacterRoutingContext as useCharacterRoutingContextFn } from '../hooks/use-character-routing-context'

const useCharacter = vi.mocked(useCharacterFn)
const useCharacterRoutingContext = vi.mocked(useCharacterRoutingContextFn)
const useCampaignsMock = vi.mocked(useCampaigns)

describe('StandaloneCharacterRedirectGuard', () => {
  beforeEach(() => {
    useCharacter.mockReset()
    useCharacterRoutingContext.mockReset()
    useCampaignsMock.mockReset()
    useCampaignsMock.mockReturnValue({
      data: [{ id: 'camp-1', identity: { name: 'Campaign One' } }],
    } as ReturnType<typeof useCampaigns>)
  })

  it('redirects to the campaign sheet with replace when membership is verified', () => {
    useCharacter.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
    } as ReturnType<typeof useCharacter>)
    useCharacterRoutingContext.mockReturnValue({
      data: { openCampaign: { id: 'camp-1' } },
      isPending: false,
    } as ReturnType<typeof useCharacterRoutingContext>)

    renderWithProviders(
      <Routes>
        <Route
          path="/characters/:characterId"
          element={
            <StandaloneCharacterRedirectGuard>
              <div>Standalone body</div>
            </StandaloneCharacterRedirectGuard>
          }
        />
        <Route
          path="/campaigns/:campaignId/characters/:characterId"
          element={<div>Campaign body</div>}
        />
      </Routes>,
      { initialEntries: ['/characters/char-1'] },
    )

    expect(screen.getByText('Campaign body')).toBeInTheDocument()
    expect(screen.queryByText('Standalone body')).not.toBeInTheDocument()
  })

  it('renders children when the viewer is not a member of the open campaign', () => {
    useCharacter.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
    } as ReturnType<typeof useCharacter>)
    useCharacterRoutingContext.mockReturnValue({
      data: { openCampaign: { id: 'camp-other' } },
      isPending: false,
    } as ReturnType<typeof useCharacterRoutingContext>)

    renderWithProviders(
      <Routes>
        <Route
          path="/characters/:characterId"
          element={
            <StandaloneCharacterRedirectGuard>
              <div>Standalone body</div>
            </StandaloneCharacterRedirectGuard>
          }
        />
        <Route
          path={ROUTES.campaign.characters.detail(':campaignId', ':characterId')}
          element={<div>Campaign body</div>}
        />
      </Routes>,
      { initialEntries: ['/characters/char-1'] },
    )

    expect(screen.getByText('Standalone body')).toBeInTheDocument()
  })
})
