import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button.client'
import { InteractiveListEmpty, InteractiveList } from './interactive-list.client'
import { InteractiveListGroupHeading } from './interactive-list-group-heading.client'
import { InteractiveListRow } from './interactive-list-row.client'
import { InteractiveListToolbar } from './interactive-list-toolbar.client'
import { InteractiveListPanel } from './interactive-list-panel.client'
import { InteractiveListViewport } from './interactive-list-viewport.client'

describe('InteractiveListRow', () => {
  it('renders name, classification, and metadata', () => {
    render(
      <InteractiveListRow name="Fireball" classification="Spell" metadata="Level 3 · Evocation" />,
    )

    expect(screen.getByText('Fireball')).toBeInTheDocument()
    expect(screen.getByText('Spell')).toBeInTheDocument()
    expect(screen.getByText('Level 3 · Evocation')).toBeInTheDocument()
  })

  it('applies highlight rail independently of selected styling', () => {
    const { rerender, container } = render(
      <InteractiveListRow name="Fireball" highlighted selected={false} />,
    )

    expect(container.firstChild).toHaveClass('bg-row-hover', 'before:bg-accent')

    rerender(<InteractiveListRow name="Fireball" highlighted={false} selected />)
    expect(container.firstChild).toHaveClass('bg-surface-subtle')
    expect(container.firstChild).not.toHaveClass('before:bg-accent')
  })

  it('applies InteractiveListSize padding on the main hit area', () => {
    const { container } = render(<InteractiveListRow name="Fireball" size="lg" />)

    expect(container.querySelector('.px-4')).toBeInTheDocument()
  })

  it('injects identity into an asChild interactive root', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <InteractiveListRow name="Fireball" classification="Spell" highlighted asChild>
        <button type="button" onClick={onSelect}>
          Extra
        </button>
      </InteractiveListRow>,
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
      <InteractiveListRow
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
      </InteractiveListRow>,
    )

    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})

describe('InteractiveListPanel', () => {
  it('forwards listbox role to the list without imposing a widget role on the panel', () => {
    render(
      <InteractiveListPanel listProps={{ role: 'listbox', 'aria-label': 'Results' }}>
        <InteractiveListRow name="Fireball" />
      </InteractiveListPanel>,
    )

    expect(screen.getByRole('listbox', { name: 'Results' })).toBeInTheDocument()
  })
})

describe('InteractiveListToolbar', () => {
  it('renders search and filter slots stacked', () => {
    render(
      <InteractiveListToolbar
        search={<input aria-label="Search" />}
        filter={<select aria-label="Filter" />}
      />,
    )

    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter')).toBeInTheDocument()
  })
})

describe('InteractiveList', () => {
  it('renders empty state copy', () => {
    render(
      <InteractiveList>
        <InteractiveListEmpty>No matches.</InteractiveListEmpty>
      </InteractiveList>,
    )

    expect(screen.getByText('No matches.')).toBeInTheDocument()
  })

  it('applies adjacent-row separator recipe on the list shell', () => {
    render(
      <InteractiveList data-testid="row-list">
        <InteractiveListRow name="A" />
        <InteractiveListRow name="B" />
      </InteractiveList>,
    )

    expect(screen.getByTestId('row-list')).toHaveClass(
      '[&>*+*]:border-t',
      '[&>*+*]:border-border-faint',
    )
  })

  it('leaves only direct row children inside the list (headings belong outside)', () => {
    render(
      <>
        <InteractiveListGroupHeading id="group" as="h2">
          Section
        </InteractiveListGroupHeading>
        <InteractiveList data-testid="row-list">
          <InteractiveListRow name="A" />
          <InteractiveListRow name="B" />
        </InteractiveList>
      </>,
    )

    const list = screen.getByTestId('row-list')
    expect(list.children).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Section' })).not.toContainElement(list)
  })

  it('applies the adjacent-child selector so a lone row has no matching separator target', () => {
    render(
      <InteractiveList data-testid="row-list">
        <InteractiveListRow name="Only" />
      </InteractiveList>,
    )

    expect(screen.getByTestId('row-list').children).toHaveLength(1)
  })
})

describe('InteractiveListGroupHeading', () => {
  it('exposes host-owned heading id', () => {
    render(
      <InteractiveListGroupHeading id="content-group" as="h2">
        Content · 14
      </InteractiveListGroupHeading>,
    )

    expect(screen.getByRole('heading', { name: 'Content · 14' })).toHaveAttribute(
      'id',
      'content-group',
    )
  })
})

describe('InteractiveListViewport', () => {
  it('wraps scrollable results', () => {
    render(
      <InteractiveListViewport data-testid="viewport">
        <InteractiveList>
          <InteractiveListRow name="Fireball" />
        </InteractiveList>
      </InteractiveListViewport>,
    )

    expect(screen.getByTestId('viewport')).toHaveClass('overflow-y-auto')
  })
})

itAxe('InteractiveListRow has no axe violations', async () => {
  const { container } = render(
    <InteractiveList>
      <InteractiveListRow
        name="Fireball"
        classification="Spell"
        metadata="Homebrew"
        highlighted
        asChild
      >
        <button type="button">Select</button>
      </InteractiveListRow>
    </InteractiveList>,
  )
  await expectNoAxeViolations(container)
})
