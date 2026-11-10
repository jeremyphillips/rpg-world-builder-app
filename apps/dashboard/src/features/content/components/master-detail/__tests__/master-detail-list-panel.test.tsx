import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN } from '../../../classes/lib/class-feature-form-labels'
import { isElementOutsideScrollport } from '../../../lib/master-detail/is-element-outside-scrollport'
import { masterDetailEmptyListLabel } from '../../../lib/master-detail/master-detail-constants'
import { MasterDetailListPanel, type MasterDetailListItem } from '../master-detail-list-panel'

vi.mock('../../../lib/master-detail/is-element-outside-scrollport', () => ({
  isElementOutsideScrollport: vi.fn(() => false),
}))

const items: MasterDetailListItem[] = [
  {
    id: 'a',
    title: 'Rage',
    meta: { eyebrow: 'Level 1', sourceLabel: 'System' },
  },
  {
    id: 'b',
    title: 'Unarmored Defense',
    meta: { eyebrow: 'Level 1', sourceLabel: 'Homebrew' },
  },
]

function baseProps() {
  return {
    items,
    selectedItemId: 'a',
    listTitle: 'Features',
    ariaLabel: 'Features',
    addLabel: 'Add feature',
    itemNoun: CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN,
    onAdd: vi.fn(),
    onSelectItem: vi.fn(),
  }
}

beforeAll(() => {
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = vi.fn()
  }
})

describe('MasterDetailListPanel', () => {
  beforeEach(() => {
    vi.mocked(isElementOutsideScrollport).mockReturnValue(false)
    vi.mocked(HTMLElement.prototype.scrollIntoView as typeof vi.fn).mockClear()
  })

  it('renders the list title at card heading scale (text-lg) independent of panel density', () => {
    render(<MasterDetailListPanel {...baseProps()} />)

    expect(screen.getByText('Features')).toHaveClass('heading-style-card')
    expect(screen.getByText('Features')).not.toHaveClass('heading-style-section')
  })

  it('renders addControl in place of the default add button', () => {
    render(
      <MasterDetailListPanel
        {...baseProps()}
        addControl={<button type="button">Custom add</button>}
      />,
    )

    expect(screen.getByRole('button', { name: 'Custom add' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Add feature/i })).not.toBeInTheDocument()
  })

  it('calls onAdd when the add button is clicked', async () => {
    const user = userEvent.setup()
    const props = baseProps()
    render(<MasterDetailListPanel {...props} />)

    await user.click(screen.getByRole('button', { name: /Add feature/i }))
    expect(props.onAdd).toHaveBeenCalledOnce()
  })

  it('uses compact interactive list selected chrome on the current row', () => {
    render(<MasterDetailListPanel {...baseProps()} selectedItemId="a" />)

    const selected = screen.getByRole('button', { name: /Rage/i })
    const unselected = screen.getByRole('button', { name: /Unarmored Defense/i })

    expect(selected).toHaveClass(
      'ui-interactive-list__main',
      'ui-interactive-list__main--interactive',
    )
    expect(selected).not.toHaveClass('ui-card', 'ui-card--selected')
    expect(selected.closest('.ui-interactive-list__row')).toHaveClass(
      'ui-interactive-row--fill-surface',
    )
    expect(unselected.closest('.ui-interactive-list__row')).not.toHaveClass(
      'ui-interactive-row--fill-surface',
    )
    expect(screen.getByRole('navigation', { name: 'Features' })).not.toHaveClass(
      'border-border-subtle',
    )
  })

  it('renders a flush compact list body without scrollport padding', () => {
    render(<MasterDetailListPanel {...baseProps()} />)

    const list = screen.getByRole('list')
    expect(list).toHaveClass('ui-interactive-list', 'ui-list--compact')
    expect(list.className).not.toMatch(/\bp-2\b/)
    expect(list.className).not.toMatch(/\bgap-2\b/)
  })

  it('calls onSelectItem with the row id when the whole row is clicked', async () => {
    const user = userEvent.setup()
    const props = baseProps()
    render(<MasterDetailListPanel {...props} />)

    await user.click(screen.getByRole('button', { name: /Unarmored Defense/i }))
    expect(props.onSelectItem).toHaveBeenCalledWith('b')
  })

  it('renders structured meta in separate eyebrow and source regions', () => {
    render(<MasterDetailListPanel {...baseProps()} />)

    expect(screen.getAllByText('Level 1')).toHaveLength(2)
    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.getByText('Homebrew')).toBeInTheDocument()
  })

  it('renders campaign-unavailable metadata below the title', () => {
    render(
      <MasterDetailListPanel
        {...baseProps()}
        items={[
          {
            id: 'a',
            title: 'Legacy Option',
            meta: { eyebrow: 'Level 5', sourceLabel: 'System' },
            availabilityStatusLabel: 'Unavailable',
          },
        ]}
      />,
    )

    expect(screen.getByText('Legacy Option')).toBeInTheDocument()
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
  })

  it('renders the empty label when there are no items', () => {
    render(<MasterDetailListPanel {...baseProps()} items={[]} selectedItemId={null} />)
    const emptyLabel = screen.getByText(
      masterDetailEmptyListLabel(CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN),
    )
    expect(emptyLabel).toBeInTheDocument()
    expect(emptyLabel).toHaveClass('ui-interactive-list__empty', 'text-start')
    expect(document.querySelector('[data-master-detail-list-scroll]')).toBeNull()
  })

  it('marks rows with validation errors and shows a metadata badge', () => {
    const errorItems: MasterDetailListItem[] = [
      {
        id: 'a',
        title: 'Rage',
        meta: { eyebrow: 'Level 1', sourceLabel: 'System' },
        issueCount: 2,
        hasError: true,
      },
    ]
    render(<MasterDetailListPanel {...baseProps()} items={errorItems} />)

    expect(screen.getByRole('button', { name: /Rage.*2 validation issues/i })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByText('2', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()
  })

  it('renders a decorative chevron in each row end region', () => {
    render(<MasterDetailListPanel {...baseProps()} />)

    expect(document.querySelectorAll('[data-icon="chevron-right"]')).toHaveLength(2)
  })

  it('does not render row delete or drag controls', () => {
    render(<MasterDetailListPanel {...baseProps()} />)

    expect(screen.queryByRole('button', { name: /Remove/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Drag to reorder/i })).not.toBeInTheDocument()
  })

  it('keeps header and count supplement outside the scroll region', () => {
    render(<MasterDetailListPanel {...baseProps()} countSupplement={<span>2 available</span>} />)

    const scrollRegion = document.querySelector('[data-master-detail-list-scroll]')
    const listShell = scrollRegion?.closest('nav')
    expect(scrollRegion).toBeInTheDocument()
    expect(scrollRegion).toHaveClass('overflow-y-auto', 'scrollbar-slim', 'pe-0')
    expect(scrollRegion?.parentElement).toHaveClass('relative')
    expect(scrollRegion).not.toHaveClass('master-detail-list-shell-viewport-cap')
    expect(listShell).toHaveClass('master-detail-list-shell-viewport-cap')
    expect(scrollRegion).not.toContainElement(screen.getByRole('button', { name: /Add feature/i }))
    expect(scrollRegion).not.toContainElement(screen.getByText('2 available'))
    expect(screen.getByText('2 available').closest('.border-b')).toBeInTheDocument()
  })

  it('renders invalid item count aligned right in the count supplement row', () => {
    render(
      <MasterDetailListPanel
        {...baseProps()}
        countSupplement={<span>22 available · 1 unavailable · Show</span>}
        invalidItemCount={3}
      />,
    )

    const supplementRow = screen.getByText(/22 available/i).closest('.border-b')
    expect(supplementRow).toHaveClass('justify-between')
    expect(screen.getByText('3', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()
  })

  it('does not scroll into view on initial mount', () => {
    render(<MasterDetailListPanel {...baseProps()} selectedItemId="a" />)

    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled()
  })

  it('scrolls the selected row into view when selection identity changes off-scrollport', () => {
    const { rerender } = render(<MasterDetailListPanel {...baseProps()} selectedItemId="a" />)

    vi.mocked(isElementOutsideScrollport).mockReturnValue(true)
    rerender(<MasterDetailListPanel {...baseProps()} selectedItemId="b" />)

    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
  })

  it('scrolls into view when the visible list projection changes off-scrollport', () => {
    const { rerender } = render(<MasterDetailListPanel {...baseProps()} selectedItemId="a" />)

    vi.mocked(isElementOutsideScrollport).mockReturnValue(true)
    rerender(
      <MasterDetailListPanel
        {...baseProps()}
        selectedItemId="a"
        items={[
          { id: 'a', title: 'Rage' },
          { id: 'x', title: 'Revealed Row' },
        ]}
      />,
    )

    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
  })

  it('does not scroll into view when the selected row is already in the scrollport', () => {
    const { rerender } = render(<MasterDetailListPanel {...baseProps()} selectedItemId="a" />)

    vi.mocked(isElementOutsideScrollport).mockReturnValue(false)
    rerender(<MasterDetailListPanel {...baseProps()} selectedItemId="b" />)

    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled()
  })

  it('renders grouped sections in one nav with one count and per-group add controls', async () => {
    const user = userEvent.setup()
    const onSelectItem = vi.fn()
    const onAddActions = vi.fn()
    const onAddReactions = vi.fn()

    render(
      <MasterDetailListPanel
        ariaLabel="Actions"
        itemNoun={CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN}
        selectedItemId="bite"
        onSelectItem={onSelectItem}
        countSupplement={<span>2 available</span>}
        invalidItemCount={1}
        groups={[
          {
            id: 'actions',
            title: 'Actions',
            addControl: (
              <button type="button" onClick={onAddActions}>
                Add action
              </button>
            ),
            items: [{ id: 'bite', title: 'Bite' }],
          },
          {
            id: 'reactions',
            title: 'Reactions',
            addControl: (
              <button type="button" onClick={onAddReactions}>
                Add reaction
              </button>
            ),
            items: [{ id: 'parry', title: 'Parry' }],
          },
        ]}
      />,
    )

    expect(screen.getAllByRole('navigation')).toHaveLength(1)
    expect(screen.getAllByText('2 available')).toHaveLength(1)
    expect(screen.getByRole('region', { name: 'Actions' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Reactions' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add reaction' }))
    expect(onAddReactions).toHaveBeenCalledOnce()
    expect(onAddActions).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /Parry/i }))
    expect(onSelectItem).toHaveBeenCalledWith('parry')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<MasterDetailListPanel {...baseProps()} />)
    await expectNoAxeViolations(container)
  })
})
