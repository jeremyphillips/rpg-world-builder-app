import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ContentCardBody } from './content-card-body.client'

describe('ContentCardBody', () => {
  it('renders full-width row layout without card shell padding', () => {
    const { container } = render(
      <ContentCardBody heading="Harbor District" subheading="Settlement overview" />,
    )

    const row = container.firstElementChild
    expect(row).toHaveClass('w-full')
    expect(row).not.toHaveClass('px-4')
    expect(row).not.toHaveClass('border')
    expect(screen.getByText('Harbor District')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <ContentCardBody heading="Harbor District" endSlot={<button type="button">Select</button>} />,
    )

    await expectNoAxeViolations(container)
  })
})
