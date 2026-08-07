import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

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

  it('applies shared digit width and trailing column when digits is set', () => {
    render(
      <Select value="8">
        <SelectTrigger aria-label="Faces" size="md" digits={2}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="8">8</SelectItem>
        </SelectContent>
      </Select>,
    )

    const trigger = screen.getByLabelText('Faces')
    expect(trigger).toHaveClass('w-[calc(2*1ch+2.75rem)]')
    expect(trigger).toHaveClass('pr-6')
    expect(trigger.querySelector('[aria-hidden]')).toHaveClass('w-5')
  })

  itAxe('has no axe accessibility violations (closed)', async () => {
    const { container } = renderSelect()
    await expectNoAxeViolations(container)
  })
})
