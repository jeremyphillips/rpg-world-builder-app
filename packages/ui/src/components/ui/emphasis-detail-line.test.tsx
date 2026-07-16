import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { EmphasisDetailLine } from './emphasis-detail-line'

describe('EmphasisDetailLine', () => {
  it('renders primary and secondary with divider', () => {
    render(
      <EmphasisDetailLine
        prefix={<span>Budget:</span>}
        primary="5 GP remaining"
        secondary="100 GP starting · 95 GP spent"
      />,
    )

    expect(screen.getByText('Budget:')).toBeInTheDocument()
    expect(screen.getByText('5 GP remaining')).toBeInTheDocument()
    expect(screen.getByText(/100 GP starting · 95 GP spent/)).toBeInTheDocument()
  })

  it('renders primary only when secondary is omitted', () => {
    render(<EmphasisDetailLine primary="50 GP needed" />)
    expect(screen.getByText('50 GP needed')).toBeInTheDocument()
    expect(screen.queryByText('·')).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <EmphasisDetailLine
        primary="50 GP needed"
        secondary="5 GP remaining"
        secondaryTone="subtle"
      />,
    )

    await expectNoAxeViolations(container)
  })
})
