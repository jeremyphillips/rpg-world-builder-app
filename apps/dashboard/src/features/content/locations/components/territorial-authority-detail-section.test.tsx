import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { GREYSHORE, YAWNING_PORTAL } from '../fixtures'
import { TERRITORIAL_AUTHORITY_SECTION_LABEL } from '../lib/territorial-authority.lib'
import { TerritorialAuthorityDetailSection } from './territorial-authority-detail-section.client'

vi.mock('@/features/content/organizations/hooks/use-organizations', () => ({
  useOrganizations: vi.fn(() => ({
    data: [{ id: 'org-realm', name: 'Realm Council', organizationKind: 'government' }],
  })),
}))

describe('TerritorialAuthorityDetailSection', () => {
  it('hides the section for non-region locations', () => {
    const { container } = render(
      <MemoryRouter>
        <TerritorialAuthorityDetailSection
          location={YAWNING_PORTAL}
          campaignId={STORY_CAMPAIGN_ID}
        />
      </MemoryRouter>,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders persisted territorial authority rows', async () => {
    const { container } = render(
      <MemoryRouter>
        <TerritorialAuthorityDetailSection
          location={{
            ...GREYSHORE,
            territorialAuthority: [
              {
                id: 'ta-governs',
                organizationId: 'org-realm',
                kind: 'governs',
              },
            ],
          }}
          campaignId={STORY_CAMPAIGN_ID}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: TERRITORIAL_AUTHORITY_SECTION_LABEL }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Governs' })).toBeInTheDocument()
    expect(screen.getByText('Realm Council')).toBeInTheDocument()
    await expectNoAxeViolations(container)
  })
})
