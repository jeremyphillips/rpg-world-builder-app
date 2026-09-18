import type { ComponentProps } from 'react'
import { render, screen } from '@testing-library/react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { describe, expect, it } from 'vitest'

import { ComboboxTrigger } from './combobox-field-parts.client'
import { Field } from './field.client'

function renderComboboxTrigger(props: ComponentProps<typeof ComboboxTrigger>) {
  return render(
    <PopoverPrimitive.Root>
      <Field.Root id="weapon" size="md">
        <ComboboxTrigger {...props} />
      </Field.Root>
    </PopoverPrimitive.Root>,
  )
}

describe('ComboboxTrigger', () => {
  it('uses px-0 py-0 shell with ValueSlot and CaretSlot anatomy', () => {
    renderComboboxTrigger({
      listboxId: 'weapon-listbox',
      open: false,
      size: 'md',
      triggerText: 'Choose weapon…',
      muted: true,
    })

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveClass('px-0', 'py-0')
    expect(trigger.querySelector('[data-select-value-slot]')).toBeInTheDocument()
    expect(trigger.querySelector('[data-select-caret-slot]')).toBeInTheDocument()
  })

  it('shows a spinner inside the caret slot while loading', () => {
    renderComboboxTrigger({
      listboxId: 'weapon-listbox',
      open: false,
      size: 'md',
      triggerText: 'Choose weapon…',
      loading: true,
      muted: true,
    })

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-busy', 'true')
    expect(trigger.querySelector('[data-select-caret-slot] [role="status"]')).toBeInTheDocument()
  })
})
