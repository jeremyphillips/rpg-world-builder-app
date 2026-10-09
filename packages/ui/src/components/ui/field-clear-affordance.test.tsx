import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FieldClearAffordanceButton } from './field-clear-affordance.client'
import {
  fieldClearAffordanceGroupedClasses,
  fieldClearAffordanceInsetVariants,
} from './field-clear-affordance.variants'
import { selectCaretSlotWidthClasses } from './select-compact-trigger.variants'

describe('FieldClearAffordanceButton', () => {
  it('applies grouped segment shell classes by default', () => {
    render(
      <FieldClearAffordanceButton size="md" accessibleName="Clear selection" onClear={vi.fn()} />,
    )

    const button = screen.getByRole('button', { name: 'Clear selection' })
    expect(button.className).toContain(selectCaretSlotWidthClasses.md)
    expect(button.className).toEqual(fieldClearAffordanceGroupedClasses('md'))
  })

  it('applies inset slot classes for SearchBar trailing clear', () => {
    render(
      <FieldClearAffordanceButton
        variant="inset"
        size="sm"
        accessibleName="Clear search"
        onClear={vi.fn()}
      />,
    )

    const button = screen.getByRole('button', { name: 'Clear search' })
    expect(button.className).toContain('inset-y-0')
    expect(button.className).toContain(selectCaretSlotWidthClasses.sm)
    expect(button.className).toEqual(fieldClearAffordanceInsetVariants({ size: 'sm' }))
  })

  it('invokes onClear when clicked', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(
      <FieldClearAffordanceButton size="md" accessibleName="Clear selection" onClear={onClear} />,
    )

    await user.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
