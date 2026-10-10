import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Input } from './input.client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'
import { Textarea } from './textarea.client'
import { UI_FIELD_CONTROL_BLOCK_CLASS } from './field-control.styles'

describe('field control readonly chrome', () => {
  it('applies semantic field block to input[readonly]', () => {
    render(<Input readOnly defaultValue="Locked" aria-label="Name" />)
    const input = screen.getByLabelText('Name')
    expect(input).toHaveAttribute('readonly')
    expect(input).toHaveClass(UI_FIELD_CONTROL_BLOCK_CLASS)
  })

  it('applies semantic field block to textarea[readonly]', () => {
    render(<Textarea readOnly defaultValue="Locked" aria-label="Notes" />)
    const textarea = screen.getByLabelText('Notes')
    expect(textarea).toHaveAttribute('readonly')
    expect(textarea).toHaveClass(UI_FIELD_CONTROL_BLOCK_CLASS)
  })

  it('keeps default field chrome on non-editable SelectTrigger hosts', () => {
    render(
      <Select>
        <SelectTrigger aria-label="Alignment">
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="n">Neutral</SelectItem>
        </SelectContent>
      </Select>,
    )

    const trigger = screen.getByLabelText('Alignment')
    expect(trigger.tagName).toBe('BUTTON')
    expect(trigger).not.toHaveAttribute('readonly')
    expect(trigger).toHaveClass(UI_FIELD_CONTROL_BLOCK_CLASS)
    expect(trigger).toHaveClass('ui-field-control--trigger')
  })
})
