import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CampaignOverviewPartySection } from './campaign-overview-party-section'

describe('CampaignOverviewPartySection', () => {
  it('renders party PCs with controlling member names', () => {
    render(
      <MemoryRouter>
        <CampaignOverviewPartySection
          campaignId="camp_1"
          party={[
            {
              character: {
                id: 'char_1',
                name: 'Verna',
                summary: 'Dwarf · Level 1 Fighter',
                campaign: { id: 'camp_1', name: 'The Argent Road' },
              },
              member: {
                id: 'member_1',
                displayName: 'Player One',
              },
              roster: { status: 'active' },
            },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Verna')).toBeInTheDocument()
    expect(screen.getByText('Played by Player One')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <CampaignOverviewPartySection campaignId="camp_1" party={[]} />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
