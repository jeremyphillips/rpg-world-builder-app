import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CollectionSummaryCell } from './collection-summary-cell.client'

const ITEMS = [
  { id: 'abjuration', label: 'School of Abjuration' },
  { id: 'evocation', label: 'School of Evocation' },
  { id: 'illusion', label: 'School of Illusion' },
  { id: 'necromancy', label: 'School of Necromancy' },
  { id: 'transmutation', label: 'School of Transmutation' },
  { id: 'enchantment', label: 'School of Enchantment' },
  { id: 'conjuration', label: 'School of Conjuration' },
  { id: 'divination', label: 'School of Divination' },
]

describe('CollectionSummaryCell', () => {
  it('renders a non-interactive empty label when there are no items', () => {
    render(<CollectionSummaryCell items={[]} singularLabel="subclass" pluralLabel="subclasses" />)

    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('uses singular tooltip heading copy for one item', async () => {
    const user = userEvent.setup()
    render(
      <CollectionSummaryCell
        items={[{ id: 'champion', label: 'Champion' }]}
        singularLabel="subclass"
        pluralLabel="subclasses"
      />,
    )

    await user.tab()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('1 subclass')
    expect(screen.getByRole('tooltip')).toHaveTextContent('Champion')
  })

  it('uses plural tooltip heading copy for multiple items', async () => {
    const user = userEvent.setup()
    render(
      <CollectionSummaryCell
        items={ITEMS.slice(0, 3)}
        singularLabel="subclass"
        pluralLabel="subclasses"
      />,
    )

    await user.tab()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('3 subclasses')
  })

  it('reveals the tooltip on keyboard focus', async () => {
    const user = userEvent.setup()
    render(
      <CollectionSummaryCell
        items={[{ id: 'rage', label: 'Rage' }]}
        singularLabel="feature"
        pluralLabel="features"
      />,
    )

    await user.tab()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Rage')
  })

  it('truncates visible tooltip items and appends +N more', async () => {
    const user = userEvent.setup()
    render(
      <CollectionSummaryCell
        items={ITEMS}
        singularLabel="subclass"
        pluralLabel="subclasses"
        maxVisibleItems={4}
      />,
    )

    await user.tab()
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('School of Abjuration')
    expect(tooltip).toHaveTextContent('+4 more')
    expect(tooltip).not.toHaveTextContent('School of Divination')
  })

  it('exposes a bounded accessible name for large sets', () => {
    render(
      <CollectionSummaryCell
        items={ITEMS}
        singularLabel="subclass"
        pluralLabel="subclasses"
        maxVisibleItems={4}
      />,
    )

    expect(screen.getByRole('button')).toHaveAccessibleName(
      '8 subclasses: School of Abjuration, School of Evocation, School of Illusion, School of Necromancy, and 4 more',
    )
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <CollectionSummaryCell
        items={ITEMS.slice(0, 2)}
        singularLabel="trait"
        pluralLabel="traits"
      />,
    )
    await expectNoAxeViolations(container)
  })
})
