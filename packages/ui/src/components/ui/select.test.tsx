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
    expect(trigger).toHaveClass('inline-flex')
    const trailingColumn = trigger.querySelector('[aria-hidden]')
    expect(trailingColumn).toHaveClass('w-5')
    expect(trailingColumn).toHaveClass('self-stretch')
    expect(trailingColumn?.querySelector('svg')).toHaveClass('size-icon-glyph-lg')
  })

  it('uses the same caret glyph step for inline and digit triggers at md size', () => {
    const { unmount: unmountInline } = render(
      <Select>
        <SelectTrigger aria-label="Inline" size="md">
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    )
    const inlineCaret = screen.getByLabelText('Inline').querySelector('svg')
    expect(inlineCaret).toHaveClass('size-icon-glyph-lg')
    unmountInline()

    render(
      <Select value="30">
        <SelectTrigger aria-label="Digit" size="md" digits={3}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="30">30</SelectItem>
        </SelectContent>
      </Select>,
    )
    const digitCaret = screen.getByLabelText('Digit').querySelector('[aria-hidden] svg')
    expect(digitCaret).toHaveClass('size-icon-glyph-lg')
  })

  itAxe('has no axe accessibility violations (closed)', async () => {
    const { container } = renderSelect()
    await expectNoAxeViolations(container)
  })
})
