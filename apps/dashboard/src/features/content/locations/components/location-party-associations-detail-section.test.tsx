import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { ALDERMERE, GREYSHORE } from '../fixtures'
import { LOCATION_PARTY_SECTION_LABEL } from '../lib/location-party-associations.lib'
import { LocationPartyAssociationsDetailSection } from './location-party-associations-detail-section.client'

vi.mock('@/features/campaign', () => ({
  useCampaignCharacters: vi.fn(() => ({ data: [] })),
}))
vi.mock('@/features/character', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    useCampaignBuildContext: vi.fn(() => ({ catalogIndex: undefined })),
    useNpcs: vi.fn(() => ({ data: [] })),
  }
})
vi.mock('@/features/content/organizations/hooks/use-organizations', () => ({
  useOrganizations: vi.fn(() => ({
    data: [{ id: 'org-realm', name: 'Realm Council', organizationKind: 'government' }],
  })),
}))

describe('LocationPartyAssociationsDetailSection', () => {
  it('hides the section for plane and world when there are no associations', () => {
    const { container: planeContainer } = render(
      <MemoryRouter>
        <LocationPartyAssociationsDetailSection
          location={ALDERMERE}
          campaignId={STORY_CAMPAIGN_ID}
        />
      </MemoryRouter>,
    )

    expect(planeContainer).toBeEmptyDOMElement()
  })

  it('renders persisted associations even when not currently available for authoring', () => {
    render(
      <MemoryRouter>
        <LocationPartyAssociationsDetailSection
          location={{
            ...GREYSHORE,
            partyAssociations: [
              {
                id: 'assoc-owner',
                kind: 'ownership',
                party: { kind: 'organization', organizationId: 'org-realm' },
              },
            ],
          }}
          campaignId={STORY_CAMPAIGN_ID}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: LOCATION_PARTY_SECTION_LABEL })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Owner' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Realm Council' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View' })).toBeInTheDocument()
  })
})
