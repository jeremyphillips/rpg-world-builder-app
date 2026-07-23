import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ContentCampaignAvailabilityAction } from './content-campaign-availability-action.client'
import {
  CAMPAIGN_ACCESS_AVAILABLE_LABEL,
  CAMPAIGN_ACCESS_PLAYER_ACCESS_PRESERVED_HINT,
  CAMPAIGN_ACCESS_SECTION_LEGEND,
} from '../campaign-access/campaign-access-labels'
import { CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL } from '../campaign-access/campaign-access-table-labels'

describe('ContentCampaignAvailabilityAction', () => {
  it('renders available state copy and helper text', () => {
    render(<ContentCampaignAvailabilityAction available onAvailableChange={vi.fn()} />)

    expect(screen.getByText(CAMPAIGN_ACCESS_SECTION_LEGEND)).toBeInTheDocument()
    expect(screen.getByText(CAMPAIGN_ACCESS_AVAILABLE_LABEL)).toBeInTheDocument()
    expect(
      screen.getByText(
        'Controls whether this content can be discovered and selected in this campaign.',
      ),
    ).toBeInTheDocument()
  })

  it('renders unavailable state with warning label and preserved-access helper', () => {
    render(<ContentCampaignAvailabilityAction available={false} onAvailableChange={vi.fn()} />)

    expect(screen.getByText(CAMPAIGN_ACCESS_TABLE_UNAVAILABLE_LABEL)).toHaveClass(
      'text-xs',
      'font-medium',
      'text-semantic-warning',
    )
    expect(screen.getByText(CAMPAIGN_ACCESS_PLAYER_ACCESS_PRESERVED_HINT)).toBeInTheDocument()
  })

  it('calls onAvailableChange when the switch is toggled', async () => {
    const user = userEvent.setup()
    const onAvailableChange = vi.fn()

    render(<ContentCampaignAvailabilityAction available onAvailableChange={onAvailableChange} />)

    await user.click(
      screen.getByRole('switch', {
        name: `${CAMPAIGN_ACCESS_AVAILABLE_LABEL} in this campaign`,
      }),
    )

    expect(onAvailableChange).toHaveBeenCalledWith(false)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <ContentCampaignAvailabilityAction available onAvailableChange={vi.fn()} />,
    )

    await expectNoAxeViolations(container)
  })
})
