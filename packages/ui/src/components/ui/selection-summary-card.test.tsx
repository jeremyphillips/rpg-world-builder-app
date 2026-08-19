import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { SelectionSummaryCard, SelectionSummaryChangeAction } from './selection-summary-card'

describe('SelectionSummaryCard', () => {
  it('renders eyebrow rows and row-level change actions', async () => {
    const user = userEvent.setup()
    const onChangeTitle = vi.fn()

    render(
      <SelectionSummaryCard
        eyebrow="Selections"
        rows={[
          {
            label: 'Title',
            value: 'Guildmaster',
            action: (
              <SelectionSummaryChangeAction
                changeLabel="Change"
                ariaLabel="Change title"
                onChange={onChangeTitle}
              />
            ),
          },
          {
            label: 'Species',
            value: 'Gnome',
          },
        ]}
      />,
    )

    expect(screen.getByText('Selections')).toBeInTheDocument()
    expect(screen.getByText('Guildmaster')).toBeInTheDocument()
    expect(screen.getByText('Gnome')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change title' }))
    expect(onChangeTitle).toHaveBeenCalledOnce()
  })

  it('calls onValueClick when the row value is clicked', async () => {
    const user = userEvent.setup()
    const onChangeTitle = vi.fn()

    render(
      <SelectionSummaryCard
        eyebrow="Selections"
        rows={[
          {
            label: 'Title',
            value: 'Guildmaster',
            onValueClick: onChangeTitle,
            valueActionAriaLabel: 'Change title',
            action: (
              <SelectionSummaryChangeAction
                changeLabel="Change"
                ariaLabel="Change title"
                onChange={onChangeTitle}
              />
            ),
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Guildmaster, Change title' }))
    expect(onChangeTitle).toHaveBeenCalledOnce()
  })

  it('renders a card-level change action when provided', async () => {
    const user = userEvent.setup()
    const onChangeSetup = vi.fn()

    render(
      <SelectionSummaryCard
        eyebrow="Setup"
        cardAction={
          <SelectionSummaryChangeAction
            changeLabel="Change"
            ariaLabel="Change setup"
            onChange={onChangeSetup}
          />
        }
        rows={[
          { label: 'Role', value: 'Apprentice' },
          { label: 'Character', value: 'Elf · Level 1 Rogue' },
        ]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Change setup' }))
    expect(onChangeSetup).toHaveBeenCalledOnce()
  })

  it('uses quiet summary chrome without selected-state ring tokens', () => {
    const { container } = render(
      <SelectionSummaryCard
        eyebrow="Selections"
        rows={[{ label: 'Title', value: 'Guildmaster' }]}
      />,
    )

    const card = container.querySelector('article')
    expect(card).toHaveClass('bg-surface-muted')
    expect(card?.className).not.toContain('ring-primary')
    expect(card?.className).not.toContain('border-primary')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <SelectionSummaryCard
        eyebrow="Selections"
        rows={[
          {
            label: 'Title',
            value: 'Guildmaster',
            action: (
              <SelectionSummaryChangeAction
                changeLabel="Change"
                ariaLabel="Change title"
                onChange={() => undefined}
              />
            ),
          },
        ]}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
