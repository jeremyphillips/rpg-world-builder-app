import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { SegmentedControl } from './segmented-control.client'

const options = [
  { value: 'alpha', label: 'Alpha', metadata: '1/3' },
  { value: 'beta', label: 'Beta', metadata: '2/4', disabled: true },
  { value: 'gamma', label: 'Gamma', metadata: '0/1' },
] as const

describe('SegmentedControl', () => {
  it('calls onValueChange for controlled selection', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <SegmentedControl
        aria-label="Modes"
        value="alpha"
        options={options}
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Gamma/i }))
    expect(onValueChange).toHaveBeenCalledWith('gamma')
  })

  it('skips disabled segments with arrow keys', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <SegmentedControl
        aria-label="Modes"
        value="alpha"
        options={options}
        onValueChange={onValueChange}
      />,
    )

    screen.getByRole('button', { pressed: true }).focus()
    await user.keyboard('{ArrowRight}')

    expect(onValueChange).toHaveBeenCalledWith('gamma')
  })

  it('renders auto-width segments without truncating labels', () => {
    render(
      <SegmentedControl
        aria-label="Search filter group"
        value="game-terms"
        segmentWidth="auto"
        options={[
          { value: 'all', label: 'All' },
          { value: 'characters', label: 'Characters' },
          { value: 'content', label: 'Content' },
          { value: 'game-terms', label: 'Game Terms' },
        ]}
        onValueChange={vi.fn()}
      />,
    )

    const gameTerms = screen.getByRole('button', { name: 'Game Terms' })
    expect(gameTerms.querySelector('span')?.className).not.toContain('truncate')
    expect(gameTerms.className).toContain('shrink-0')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <SegmentedControl
        aria-label="Modes"
        value="alpha"
        options={options}
        onValueChange={vi.fn()}
        fullWidth
      />,
    )

    await expectNoAxeViolations(container)
  })
})
