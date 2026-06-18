import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'

function renderSelect(props: Record<string, unknown> = {}) {
  return render(
    <Select {...props}>
      <SelectTrigger aria-label="Alignment">
        <SelectValue placeholder="Choose…" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="lg">Lawful Good</SelectItem>
        <SelectItem value="n">Neutral</SelectItem>
      </SelectContent>
    </Select>,
  )
}

describe('Select', () => {
  it('renders the trigger with its placeholder', () => {
    renderSelect()
    const trigger = screen.getByLabelText('Alignment')
    expect(trigger).toHaveTextContent('Choose…')
  })

  it('shows the selected value when controlled', () => {
    renderSelect({ value: 'n' })
    expect(screen.getByLabelText('Alignment')).toHaveTextContent('Neutral')
  })

  it('has no axe accessibility violations (closed)', async () => {
    const { container } = renderSelect()
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
