import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { CHARACTER_CONTROLLER_DISPLAY } from '@/features/character'

import { CampaignOverviewPartySection } from './campaign-overview-party-section'

describe('CampaignOverviewPartySection', () => {
  it('renders party PCs with controlling member names inside the card', () => {
    render(
      <MemoryRouter>
        <CampaignOverviewPartySection
          campaignId="camp_1"
          openControlledCharacterIds={[]}
          party={[
            {
              character: {
                id: 'char_1',
                name: 'Verna',
                summary: 'Dwarf · Level 1 Fighter',
                classIds: [],
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
    expect(
      screen.getByText(CHARACTER_CONTROLLER_DISPLAY.playedBy('Player One')),
    ).toBeInTheDocument()
    expect(screen.queryByText('The Argent Road')).not.toBeInTheDocument()
  })

  it('renders played-by-you copy when the viewer controls the character', () => {
    render(
      <MemoryRouter>
        <CampaignOverviewPartySection
          campaignId="camp_1"
          openControlledCharacterIds={['char_1']}
          party={[
            {
              character: {
                id: 'char_1',
                name: 'Verna',
                summary: 'Dwarf · Level 1 Fighter',
                classIds: [],
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

    expect(screen.getByText(CHARACTER_CONTROLLER_DISPLAY.playedByYou)).toBeInTheDocument()
  })

  it('renders no-player copy for unassigned characters', () => {
    render(
      <MemoryRouter>
        <CampaignOverviewPartySection
          campaignId="camp_1"
          openControlledCharacterIds={[]}
          party={[
            {
              character: {
                id: 'char_2',
                name: 'Unassigned PC',
                summary: 'Human · Level 1 Wizard',
                classIds: [],
                campaign: { id: 'camp_1', name: 'The Argent Road' },
              },
              member: null,
              roster: { status: 'inactive' },
            },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText(CHARACTER_CONTROLLER_DISPLAY.noPlayerAssigned)).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <CampaignOverviewPartySection
          campaignId="camp_1"
          openControlledCharacterIds={[]}
          party={[]}
        />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
