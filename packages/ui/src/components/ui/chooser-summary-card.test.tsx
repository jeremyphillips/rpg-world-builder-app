import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { ChooserSummaryCard } from './chooser-summary-card'

describe('ChooserSummaryCard', () => {
  it('renders the summary and change action', () => {
    render(
      <ChooserSummaryCard
        eyebrow="Connection type"
        changeLabel="Change connection type"
        title="Governs"
        description="Exercises political authority over this region."
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Connection type')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Governs' })).toBeInTheDocument()
    expect(screen.getByText('Exercises political authority over this region.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change connection type' })).toBeInTheDocument()
  })

  it('calls onChange when the action is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <ChooserSummaryCard
        eyebrow="Connection type"
        changeLabel="Change connection type"
        title="Governs"
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Change connection type' }))

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <ChooserSummaryCard
        eyebrow="Connection type"
        changeLabel="Change connection type"
        title="Governs"
        description="Exercises political authority over this region."
        onChange={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
