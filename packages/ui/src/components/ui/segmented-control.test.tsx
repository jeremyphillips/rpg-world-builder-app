import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
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

  it('styles metadata one step below the segment label', () => {
    render(
      <SegmentedControl
        aria-label="Search filter group"
        value="content"
        segmentWidth="auto"
        options={[
          { value: 'all', label: 'All', metadata: '24' },
          { value: 'content', label: 'Content', metadata: '14' },
        ]}
        onValueChange={vi.fn()}
      />,
    )

    const activeMetadata = screen
      .getByRole('button', { name: /Content/i })
      .querySelector('span:last-child')
    const inactiveMetadata = screen
      .getByRole('button', { name: /All/i })
      .querySelector('span:last-child')

    expect(activeMetadata).toHaveClass('text-xs', 'text-foreground-subtle')
    expect(activeMetadata?.className).not.toContain('font-light')
    expect(inactiveMetadata).toHaveClass('text-xs', 'text-foreground-disabled')
  })

  it('supports null value with no active segment', () => {
    render(
      <SegmentedControl
        aria-label="Related to"
        value={null}
        options={[
          { value: 'character', label: 'Characters', disabled: true },
          { value: 'organization', label: 'Organizations', disabled: true },
        ]}
        onValueChange={vi.fn()}
        fullWidth
      />,
    )

    expect(screen.queryByRole('button', { pressed: true })).not.toBeInTheDocument()
  })

  it('renders a leading icon that is hidden from the accessible name', () => {
    render(
      <SegmentedControl
        aria-label="Modes"
        value="alpha"
        options={[
          {
            value: 'alpha',
            label: 'Alpha',
            leadingIcon: <span data-testid="leading-icon">★</span>,
          },
        ]}
        onValueChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Alpha' })).toBeInTheDocument()
    expect(screen.getByTestId('leading-icon').parentElement).toHaveAttribute('aria-hidden')
  })

  it('forwards trailing content and button props onto the segment', () => {
    render(
      <SegmentedControl
        aria-label="Modes"
        value="alpha"
        options={[
          {
            value: 'alpha',
            label: 'Alpha',
            trailing: <span data-testid="trailing">2</span>,
            buttonProps: { 'data-tab-trigger': 'alpha', 'aria-controls': 'alpha-panel' },
          },
        ]}
        onValueChange={vi.fn()}
      />,
    )

    const segment = screen.getByRole('button', { name: /Alpha/ })
    expect(screen.getByTestId('trailing')).toBeInTheDocument()
    expect(segment).toHaveAttribute('data-tab-trigger', 'alpha')
    expect(segment).toHaveAttribute('aria-controls', 'alpha-panel')
  })

  itAxe('has no axe accessibility violations', async () => {
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
