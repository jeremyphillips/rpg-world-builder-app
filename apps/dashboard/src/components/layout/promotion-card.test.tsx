import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { buttonVariants } from '@rpg/ui'

import { PromotionCard } from './promotion-card'

describe('PromotionCard', () => {
  it('renders title, description, meta, and actions', () => {
    render(
      <PromotionCard
        title="Campaign invitation"
        description="Avery invited you to join this campaign."
        meta="Expires today"
        actions={
          <a href="/review" className={buttonVariants({ size: 'sm' })}>
            Review invitation
          </a>
        }
      />,
    )

    expect(screen.getByText('Campaign invitation')).toBeInTheDocument()
    expect(screen.getByText('Avery invited you to join this campaign.')).toBeInTheDocument()
    expect(screen.getByText('Expires today')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Review invitation' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <PromotionCard
        tone="warning"
        title="Finish joining Stormwatch"
        description="Create or connect a character to complete your campaign setup."
      />,
    )

    await expectNoAxeViolations(container)
  })
})
