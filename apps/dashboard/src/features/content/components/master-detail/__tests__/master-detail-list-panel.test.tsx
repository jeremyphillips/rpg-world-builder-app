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
    selectedIndex: 0,
    listTitle: 'Features',
    ariaLabel: 'Features',
    addLabel: 'Add feature',
    itemNoun: CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN,
    onAdd: vi.fn(),
    onSelect: vi.fn(),
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

  it('calls onAdd when the add button is clicked', async () => {
    const user = userEvent.setup()
    const props = baseProps()
    render(<MasterDetailListPanel {...props} />)

    await user.click(screen.getByRole('button', { name: /Add feature/i }))
    expect(props.onAdd).toHaveBeenCalledOnce()
  })

  it('calls onSelect with the row index when the whole row is clicked', async () => {
    const user = userEvent.setup()
    const props = baseProps()
    render(<MasterDetailListPanel {...props} />)

    await user.click(screen.getByRole('button', { name: /Unarmored Defense/i }))
    expect(props.onSelect).toHaveBeenCalledWith(1)
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
            active: false,
            availabilityStatusLabel: 'Unavailable',
          },
        ]}
      />,
    )

    expect(screen.getByText('Legacy Option')).toBeInTheDocument()
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
  })

  it('renders the empty label when there are no items', () => {
    render(<MasterDetailListPanel {...baseProps()} items={[]} selectedIndex={null} />)
    expect(
      screen.getByText(masterDetailEmptyListLabel(CLASS_FEATURE_MASTER_DETAIL_ITEM_NOUN)),
    ).toBeInTheDocument()
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

    expect(document.querySelectorAll('[aria-hidden] svg.lucide-chevron-right')).toHaveLength(2)
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
    render(<MasterDetailListPanel {...baseProps()} selectedIndex={0} />)

    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled()
  })

  it('scrolls the selected row into view when selection identity changes off-scrollport', () => {
    const { rerender } = render(<MasterDetailListPanel {...baseProps()} selectedIndex={0} />)

    vi.mocked(isElementOutsideScrollport).mockReturnValue(true)
    rerender(<MasterDetailListPanel {...baseProps()} selectedIndex={1} />)

    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
  })

  it('scrolls into view when the visible list projection changes off-scrollport', () => {
    const { rerender } = render(<MasterDetailListPanel {...baseProps()} selectedIndex={0} />)

    vi.mocked(isElementOutsideScrollport).mockReturnValue(true)
    rerender(
      <MasterDetailListPanel
        {...baseProps()}
        selectedIndex={0}
        items={[
          { id: 'x', title: 'Revealed Row' },
          { id: 'b', title: 'Unarmored Defense' },
        ]}
      />,
    )

    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
  })

  it('does not scroll into view when the selected row is already in the scrollport', () => {
    const { rerender } = render(<MasterDetailListPanel {...baseProps()} selectedIndex={0} />)

    vi.mocked(isElementOutsideScrollport).mockReturnValue(false)
    rerender(<MasterDetailListPanel {...baseProps()} selectedIndex={1} />)

    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<MasterDetailListPanel {...baseProps()} />)
    await expectNoAxeViolations(container)
  })
})
