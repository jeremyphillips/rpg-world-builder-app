import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SortMenu, sortMenuFlatSections } from './sort-menu.client'

const nameSortSections = sortMenuFlatSections([
  { value: 'name_asc', label: 'Name: A–Z', triggerLabel: 'A–Z' },
  { value: 'name_desc', label: 'Name: Z–A', triggerLabel: 'Z–A' },
])

describe('SortMenu', () => {
  it('names the trigger from the label and current selection', () => {
    render(<SortMenu value="name_asc" sections={nameSortSections} onValueChange={vi.fn()} />)

    const trigger = screen.getByRole('button', { name: 'Sort by, A–Z' })
    expect(trigger).toHaveTextContent('A–Z')
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('selects a sort mode from the menu', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<SortMenu value="name_asc" sections={nameSortSections} onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button', { name: 'Sort by, A–Z' }))
    await user.click(screen.getByRole('menuitemradio', { name: 'Name: Z–A' }))

    expect(onValueChange).toHaveBeenCalledWith('name_desc')
  })

  it('keeps trigger width stable across selections', () => {
    const { rerender } = render(
      <SortMenu value="name_asc" sections={nameSortSections} onValueChange={vi.fn()} />,
    )
    const narrowWidth = screen
      .getByRole('button', { name: 'Sort by, A–Z' })
      .getBoundingClientRect().width

    rerender(<SortMenu value="name_desc" sections={nameSortSections} onValueChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Sort by, Z–A' }).getBoundingClientRect().width).toBe(
      narrowWidth,
    )
  })
})
