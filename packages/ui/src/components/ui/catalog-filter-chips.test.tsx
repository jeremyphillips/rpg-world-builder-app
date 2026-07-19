import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

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

    expect(screen.getByText('Category')).toHaveAttribute('id', 'category-label')
    expect(screen.getByRole('radio', { name: 'All' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
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
