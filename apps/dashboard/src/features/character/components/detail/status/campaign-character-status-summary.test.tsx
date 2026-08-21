import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { createDefaultCampaignRosterState, createDefaultCharacterVitalState } from '@rpg/contracts'

import { CampaignCharacterStatusSummary } from './campaign-character-status-summary'

describe('CampaignCharacterStatusSummary', () => {
  it('renders roster and vital labels', () => {
    const { getByText } = render(
      <CampaignCharacterStatusSummary
        vital={createDefaultCharacterVitalState()}
        roster={createDefaultCampaignRosterState()}
      />,
    )

    expect(getByText('Roster: Active')).toBeInTheDocument()
    expect(getByText('Vital: Alive')).toBeInTheDocument()
  })

  itAxe('has no axe violations', async () => {
    const { container } = render(
      <CampaignCharacterStatusSummary
        vital={createDefaultCharacterVitalState()}
        roster={createDefaultCampaignRosterState()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
