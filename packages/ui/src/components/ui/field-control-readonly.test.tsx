import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Input } from './input.client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'
import { Textarea } from './textarea.client'
import { fieldInputReadonlyClasses } from './field-input-chrome.variants'

describe('field control readonly chrome', () => {
  it('uses attribute selector utilities, not CSS :read-only', () => {
    expect(fieldInputReadonlyClasses).toContain('[readonly]:bg-input-readonly')
    expect(fieldInputReadonlyClasses).toContain('[readonly]:border-input-readonly')
    expect(fieldInputReadonlyClasses).not.toContain('read-only:')
  })

  it('applies readonly chrome recipe to input[readonly]', () => {
    render(<Input readOnly defaultValue="Locked" aria-label="Name" />)
    const input = screen.getByLabelText('Name')
    expect(input).toHaveAttribute('readonly')
    expect(input.className).toContain('[readonly]:bg-input-readonly')
    expect(input.className).toContain('[readonly]:border-input-readonly')
  })

  it('applies readonly chrome recipe to textarea[readonly]', () => {
    render(<Textarea readOnly defaultValue="Locked" aria-label="Notes" />)
    const textarea = screen.getByLabelText('Notes')
    expect(textarea).toHaveAttribute('readonly')
    expect(textarea.className).toContain('[readonly]:bg-input-readonly')
    expect(textarea.className).toContain('[readonly]:border-input-readonly')
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
    expect(trigger).toHaveClass('bg-input', 'border-input')
  })
})
