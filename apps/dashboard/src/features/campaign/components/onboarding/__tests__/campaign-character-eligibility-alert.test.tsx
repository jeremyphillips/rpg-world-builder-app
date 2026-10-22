import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import type { CharacterCampaignBlockingIssue, CharacterCampaignWarning } from '@rpg/contracts'

import { CampaignCharacterEligibilityAlert } from '../campaign-character-eligibility-alert'

const blockingIssue: CharacterCampaignBlockingIssue = {
  code: 'level_mismatch',
  actualLevel: 3,
  requiredLevel: 1,
}

const warning: CharacterCampaignWarning = {
  code: 'content_unavailable',
  category: 'spells',
  contentId: 'spell:shield',
  label: 'Shield is not available in this campaign',
}

describe('CampaignCharacterEligibilityAlert', () => {
  it('renders nothing when there are no blocking issues', () => {
    const { container } = render(<CampaignCharacterEligibilityAlert blockingIssues={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('announces blocking issues in a destructive alert', () => {
    render(
      <CampaignCharacterEligibilityAlert
        blockingIssues={[blockingIssue]}
        heading="This build cannot join the campaign yet:"
      />,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('ui-alert--destructive')
    expect(alert).toHaveTextContent('This build cannot join the campaign yet:')
    expect(alert).toHaveTextContent('Campaign starts at level 1')
  })

  it('embeds warning review without a nested alert', () => {
    render(
      <CampaignCharacterEligibilityAlert
        blockingIssues={[
          blockingIssue,
          { code: 'species_unavailable', contentId: 'species:elf', label: 'Elf' },
        ]}
        warnings={[warning]}
      />,
    )

    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(screen.getByText('Review campaign differences')).toBeInTheDocument()
    expect(screen.getByText(warning.label)).toBeInTheDocument()
  })
})
