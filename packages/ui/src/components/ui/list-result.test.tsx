import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button.client'
import { ListResultEmpty, ListResultList } from './list-result-list.client'
import { ListResultGroupHeading } from './list-result-group-heading.client'
import { ListResultItem } from './list-result-item.client'
import { ListResultToolbar } from './list-result-toolbar.client'
import { ListResultViewport } from './list-result-viewport.client'

describe('ListResultItem', () => {
  it('renders name, classification, and metadata', () => {
    render(<ListResultItem name="Fireball" classification="Spell" metadata="Level 3 · Evocation" />)

    expect(screen.getByText('Fireball')).toBeInTheDocument()
    expect(screen.getByText('Spell')).toBeInTheDocument()
    expect(screen.getByText('Level 3 · Evocation')).toBeInTheDocument()
  })

  it('applies highlight rail independently of selected styling', () => {
    const { rerender, container } = render(
      <ListResultItem name="Fireball" highlighted selected={false} />,
    )

    expect(container.firstChild).toHaveClass('bg-control-hover', 'before:bg-accent')

    rerender(<ListResultItem name="Fireball" highlighted={false} selected />)
    expect(container.firstChild).toHaveClass('bg-surface-subtle')
    expect(container.firstChild).not.toHaveClass('before:bg-accent')
  })

  it('injects identity into an asChild interactive root', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <ListResultItem name="Fireball" classification="Spell" highlighted asChild>
        <button type="button" onClick={onSelect}>
          Extra
        </button>
      </ListResultItem>,
    )

    const button = screen.getByRole('button', { name: /Fireball/i })
    expect(button).toHaveTextContent('Extra')
    await user.click(button)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('renders trailing actions outside the main hit area', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()

    render(
      <ListResultItem
        name="Fireball"
        classification="Spell"
        selected
        asChild
        trailingAction={
          <Button type="button" variant="ghost" size="icon" aria-label="Clear" onClick={onClear}>
            X
          </Button>
        }
      >
        <button type="button">Select</button>
      </ListResultItem>,
    )

    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})

describe('ListResultToolbar', () => {
  it('renders search and filter slots stacked', () => {
    render(
      <ListResultToolbar
        search={<input aria-label="Search" />}
        filter={<select aria-label="Filter" />}
      />,
    )

    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter')).toBeInTheDocument()
  })
})

describe('ListResultList', () => {
  it('renders empty state copy', () => {
    render(
      <ListResultList>
        <ListResultEmpty>No matches.</ListResultEmpty>
      </ListResultList>,
    )

    expect(screen.getByText('No matches.')).toBeInTheDocument()
  })
})

describe('ListResultGroupHeading', () => {
  it('exposes host-owned heading id', () => {
    render(
      <ListResultGroupHeading id="content-group" as="h2">
        Content · 14
      </ListResultGroupHeading>,
    )

    expect(screen.getByRole('heading', { name: 'Content · 14' })).toHaveAttribute(
      'id',
      'content-group',
    )
  })

  it('applies first inset and follows-complete top border', () => {
    const { rerender } = render(
      <ListResultGroupHeading first follows="none" as="h2">
        Content · 14
      </ListResultGroupHeading>,
    )

    const firstHeading = screen.getByRole('heading', { name: 'Content · 14' })
    expect(firstHeading).toHaveClass('pt-2')
    expect(firstHeading.className).not.toContain('border-t')

    rerender(
      <ListResultGroupHeading follows="complete" as="h2">
        Game terms · 2
      </ListResultGroupHeading>,
    )

    expect(screen.getByRole('heading', { name: 'Game terms · 2' }).className).toContain('border-t')
  })
})

describe('ListResultViewport', () => {
  it('wraps scrollable results', () => {
    render(
      <ListResultViewport data-testid="viewport">
        <ListResultList>
          <ListResultItem name="Fireball" />
        </ListResultList>
      </ListResultViewport>,
    )

    expect(screen.getByTestId('viewport')).toHaveClass('overflow-y-auto')
  })
})

itAxe('ListResultItem has no axe violations', async () => {
  const { container } = render(
    <ListResultList>
      <ListResultItem
        name="Fireball"
        classification="Spell"
        metadata="Homebrew"
        highlighted
        asChild
      >
        <button type="button">Select</button>
      </ListResultItem>
    </ListResultList>,
  )
  await expectNoAxeViolations(container)
})
