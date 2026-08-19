import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { SetupSummaryCard, SetupSummaryCardChangeAction } from './setup-summary-card.client'

describe('SetupSummaryCard', () => {
  it('renders eyebrow rows and row-level change actions', async () => {
    const user = userEvent.setup()
    const onChangeTitle = vi.fn()

    render(
      <SetupSummaryCard
        eyebrow="Selections"
        rows={[
          {
            label: 'Title',
            value: 'Guildmaster',
            action: (
              <SetupSummaryCardChangeAction
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
      <SetupSummaryCard
        eyebrow="Selections"
        rows={[
          {
            label: 'Title',
            value: 'Guildmaster',
            onValueClick: onChangeTitle,
            valueActionAriaLabel: 'Change title',
            action: (
              <SetupSummaryCardChangeAction
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
      <SetupSummaryCard
        eyebrow="Setup"
        cardAction={
          <SetupSummaryCardChangeAction
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
      <SetupSummaryCard eyebrow="Selections" rows={[{ label: 'Title', value: 'Guildmaster' }]} />,
    )

    const card = container.querySelector('article')
    expect(card).toHaveClass('bg-surface-muted')
    expect(card?.className).not.toContain('ring-primary')
    expect(card?.className).not.toContain('border-primary')
  })

  it('renders colon labels and reserves compact control height on the primary line', () => {
    const { container } = render(
      <SetupSummaryCard
        eyebrow="Setup"
        rows={[
          { label: 'Role', value: 'No title' },
          {
            label: 'Title',
            value: 'Guildmaster',
            action: (
              <SetupSummaryCardChangeAction
                changeLabel="Change"
                ariaLabel="Change title"
                onChange={() => undefined}
              />
            ),
          },
        ]}
      />,
    )

    expect(screen.getByText('Role:')).toBeInTheDocument()
    expect(screen.getByText('Title:')).toBeInTheDocument()
    expect(container.querySelector('.min-h-control-action-compact')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change title' })).toHaveClass(
      'h-control-action-compact',
    )
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <SetupSummaryCard
        eyebrow="Selections"
        rows={[
          {
            label: 'Title',
            value: 'Guildmaster',
            action: (
              <SetupSummaryCardChangeAction
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
