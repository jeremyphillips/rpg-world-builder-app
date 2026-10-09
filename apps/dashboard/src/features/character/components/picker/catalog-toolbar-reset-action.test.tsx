import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { resultCountSizerLabels } from '@/lib/data-table/format-result-count.lib'

import {
  CATALOG_TOOLBAR_RESET_VISIBLE_LABEL,
  CATALOG_TOOLBAR_RESET_WITHOUT_SORT_NAME,
  CATALOG_TOOLBAR_RESET_WITH_SORT_NAME,
  CatalogToolbarResetSlot,
} from './catalog-toolbar-reset-action'

describe('CatalogToolbarResetSlot', () => {
  it('names a visible reset for search, filters, and sorting when sort is present', () => {
    render(<CatalogToolbarResetSlot visible includesSort onClick={vi.fn()} />)

    const button = screen.getByRole('button', { name: CATALOG_TOOLBAR_RESET_WITH_SORT_NAME })
    expect(button).toHaveTextContent(CATALOG_TOOLBAR_RESET_VISIBLE_LABEL)
    expect(button).toHaveAttribute('title', CATALOG_TOOLBAR_RESET_WITH_SORT_NAME)
    expect(button).toHaveClass('h-6')
    expect(button.querySelector('svg')).toHaveClass('size-icon-glyph-sm')
  })

  it('omits sorting from the accessible name when the toolbar has no sort', () => {
    render(<CatalogToolbarResetSlot visible includesSort={false} onClick={vi.fn()} />)

    const button = screen.getByRole('button', { name: CATALOG_TOOLBAR_RESET_WITHOUT_SORT_NAME })
    expect(button).toHaveTextContent(CATALOG_TOOLBAR_RESET_VISIBLE_LABEL)
    expect(button).toHaveAttribute('title', CATALOG_TOOLBAR_RESET_WITHOUT_SORT_NAME)
  })

  it('reserves an idle row when a utility band has no sort', () => {
    const { container } = render(
      <CatalogToolbarResetSlot visible={false} reserve includesSort={false} onClick={vi.fn()} />,
    )

    expect(
      screen.queryByRole('button', { name: CATALOG_TOOLBAR_RESET_WITHOUT_SORT_NAME }),
    ).not.toBeInTheDocument()
    const reserved = container.querySelector('.invisible')
    expect(reserved).toHaveAttribute('aria-hidden', 'true')
    expect(reserved?.querySelector('button')).toHaveAttribute('tabindex', '-1')
  })

  it('reserves an idle row when sort is persistent', () => {
    const { container } = render(
      <CatalogToolbarResetSlot visible={false} includesSort onClick={vi.fn()} />,
    )

    expect(
      screen.queryByRole('button', { name: CATALOG_TOOLBAR_RESET_WITH_SORT_NAME }),
    ).not.toBeInTheDocument()
    const reserved = container.querySelector('.invisible')
    expect(reserved).toHaveAttribute('aria-hidden', 'true')
    expect(reserved?.querySelector('button')).toHaveAttribute('tabindex', '-1')
  })

  it('mounts nothing while idle when the toolbar has no sort', () => {
    const { container } = render(
      <CatalogToolbarResetSlot visible={false} includesSort={false} onClick={vi.fn()} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('announces the visible result count beside reset', () => {
    render(
      <CatalogToolbarResetSlot
        visible
        includesSort
        summaryVisibleCount={4}
        summaryReserveLabels={resultCountSizerLabels(24)}
        onClick={vi.fn()}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('4 results')
    expect(document.querySelector('[data-filter-toolbar-sizer-label]')).toHaveTextContent(
      '0 results',
    )
    expect(document.querySelectorAll('[data-filter-toolbar-sizer-label]')).toHaveLength(25)
  })

  it('shows the count while reset stays hidden', () => {
    render(
      <CatalogToolbarResetSlot
        visible={false}
        includesSort={false}
        summaryVisibleCount={87}
        summaryReserveLabels={resultCountSizerLabels(87)}
        onClick={vi.fn()}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('87 results')
    expect(
      screen.queryByRole('button', { name: CATALOG_TOOLBAR_RESET_WITHOUT_SORT_NAME }),
    ).not.toBeInTheDocument()
  })

  it('uses a caller label without the reset accessible name', () => {
    render(<CatalogToolbarResetSlot visible includesSort label="Start over" onClick={vi.fn()} />)

    const button = screen.getByRole('button', { name: 'Start over' })
    expect(button).toHaveTextContent('Start over')
    expect(button).toHaveAttribute('title', 'Start over')
    expect(
      screen.queryByRole('button', { name: CATALOG_TOOLBAR_RESET_WITH_SORT_NAME }),
    ).not.toBeInTheDocument()
  })
})
