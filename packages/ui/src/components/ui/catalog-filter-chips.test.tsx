import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { FilterChromeProvider } from '../../filters/filter-chrome.context'
import { CatalogFilterChips } from './catalog-filter-chips.client'

const options = [
  { value: 'all', label: 'All' },
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' },
]

describe('CatalogFilterChips', () => {
  it('supports multiple selection', async () => {
    const user = userEvent.setup()
    const onSelectedValuesChange = vi.fn()

    render(
      <CatalogFilterChips
        id="levels"
        label="Levels"
        selectionMode="multiple"
        options={options}
        selectedValues={['all']}
        onSelectedValuesChange={onSelectedValuesChange}
      />,
    )

    await user.click(screen.getByRole('checkbox', { name: 'One' }))
    expect(onSelectedValuesChange).toHaveBeenCalledWith(['all', 'one'])
  })

  it('keeps single-required selection when the active chip is clicked again', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <CatalogFilterChips
        id="category"
        label="Category"
        selectionMode="single-required"
        options={options}
        value="one"
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('radio', { name: 'One' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('changes single-required selection when another chip is clicked', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <CatalogFilterChips
        id="category"
        label="Category"
        selectionMode="single-required"
        options={options}
        value="one"
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('radio', { name: 'Two' }))
    expect(onValueChange).toHaveBeenCalledWith('two')
  })

  it('uses md chip size by default', () => {
    render(
      <CatalogFilterChips
        id="category"
        label="Category"
        selectionMode="single-required"
        options={options}
        value="all"
        onValueChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('radio', { name: 'All' })).toHaveClass('text-sm-meta')
    expect(screen.getByRole('radio', { name: 'All' })).toHaveClass('px-3')
  })

  it('accepts an optional chipSize override', () => {
    render(
      <CatalogFilterChips
        id="category"
        label="Category"
        selectionMode="single-required"
        options={options}
        value="all"
        onValueChange={vi.fn()}
        chipSize="sm"
      />,
    )

    expect(screen.getByRole('radio', { name: 'All' })).toHaveClass('text-xs-meta')
    expect(screen.getByRole('radio', { name: 'All' })).toHaveClass('px-2')
  })

  it('associates the chip group with the visible label', () => {
    render(
      <CatalogFilterChips
        id="category"
        label="Category"
        selectionMode="single-required"
        options={options}
        value="all"
        onValueChange={vi.fn()}
      />,
    )

    const caption = screen.getByText('Category')
    expect(caption).toHaveAttribute('id', 'category-label')
    expect(caption.tagName).toBe('SPAN')
    expect(caption).toHaveClass('text-xs', 'text-muted-foreground')
    expect(screen.getByRole('radio', { name: 'All' })).toBeInTheDocument()
  })

  it('uses comfortable caption classes inside comfortable chrome', () => {
    render(
      <FilterChromeProvider density="comfortable">
        <CatalogFilterChips
          id="category"
          label="Category"
          selectionMode="single-required"
          options={options}
          value="all"
          onValueChange={vi.fn()}
        />
      </FilterChromeProvider>,
    )

    const caption = screen.getByText('Category')
    expect(caption).toHaveClass('text-sm', 'text-muted-foreground')
    expect(caption).not.toHaveClass('text-xs')
  })

  it('ignores presentation label classes and follows filter chrome', () => {
    render(
      <CatalogFilterChips
        id="category"
        label="Category"
        presentation={{
          type: 'chips',
          labelClassName: 'text-lg',
          groupClassName: '',
          controlBandClassName: 'flex items-start min-h-0 h-auto',
          alignmentAnchorClassName: '',
          chipSize: 'sm',
          shellClassName: 'gap-1',
        }}
        selectionMode="single-required"
        options={options}
        value="all"
        onValueChange={vi.fn()}
      />,
    )

    const caption = screen.getByText('Category')
    expect(caption).toHaveClass('text-xs', 'text-muted-foreground')
    expect(caption).not.toHaveClass('text-lg')
    expect(screen.getByRole('radio', { name: 'All' })).toHaveClass('text-xs-meta')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <CatalogFilterChips
        id="category"
        label="Category"
        selectionMode="multiple"
        options={options}
        selectedValues={['all']}
        onSelectedValuesChange={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
