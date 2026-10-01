import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ComboboxOptionRow } from './combobox-option-row.client'

describe('ComboboxOptionRow', () => {
  it('renders as an option with aria-selected reflecting selected', () => {
    render(
      <ComboboxOptionRow optionId="opt-a" heading="Option A" selected={false} onSelect={vi.fn()} />,
    )

    const option = screen.getByRole('option', { name: 'Option A' })
    expect(option).toHaveAttribute('aria-selected', 'false')
  })

  it('sets aria-selected true when selected', () => {
    render(<ComboboxOptionRow optionId="opt-a" heading="Option A" selected onSelect={vi.fn()} />)

    expect(screen.getByRole('option', { name: 'Option A' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('invokes onSelect when clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <ComboboxOptionRow
        optionId="opt-a"
        heading="Option A"
        selected={false}
        onSelect={onSelect}
      />,
    )

    await user.click(screen.getByRole('option', { name: 'Option A' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})
