/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createBooleanFilter, createEqualsFilter, createFilterSchema } from '@rpg/ui/filters'

import { PrimaryFilterPanel } from './primary-filter-bar-region.client'

type DemoRow = { id: string; status: string; hidden: boolean }
type DemoState = { unread?: boolean; status?: 'draft' | 'published' }

const schema = createFilterSchema<DemoRow, DemoState>([
  createBooleanFilter<DemoRow, DemoState, 'unread'>({
    id: 'unread',
    label: 'Unread only',
    placement: 'primary',
    getValue: (row) => !row.hidden,
  }),
  createEqualsFilter<DemoRow, DemoState, 'status', 'draft' | 'published'>({
    id: 'status',
    label: 'Status',
    placement: 'primary',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
    getValue: (row) => row.status as 'draft' | 'published',
    showAllOption: true,
  }),
])

describe('PrimaryFilterPanel', () => {
  it('renders active chips and omits the FilterBar reset when chips are enabled', async () => {
    const user = userEvent.setup()
    const clearFilterField = vi.fn()
    const resetFilters = vi.fn()

    render(
      <PrimaryFilterPanel
        filterSchema={schema}
        filterState={{ unread: true, status: 'draft' }}
        onValueChange={vi.fn()}
        clearFilterField={clearFilterField}
        resetFilters={resetFilters}
        orientation="vertical"
      />,
    )

    expect(screen.getByRole('button', { name: 'Clear unread only filter' })).toBeInTheDocument()
    expect(screen.getByText('Status: Draft')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear all' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Clear filters/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear unread only filter' }))
    expect(clearFilterField).toHaveBeenCalledWith('unread')

    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(resetFilters).toHaveBeenCalledTimes(1)
  })

  it('hides chips when showActiveChips is false', () => {
    render(
      <PrimaryFilterPanel
        filterSchema={schema}
        filterState={{ unread: true }}
        onValueChange={vi.fn()}
        clearFilterField={vi.fn()}
        resetFilters={vi.fn()}
        showActiveChips={false}
      />,
    )

    expect(
      screen.queryByRole('button', { name: 'Clear unread only filter' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Unread only' })).toBeInTheDocument()
  })
})
