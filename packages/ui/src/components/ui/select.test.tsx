import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  Select,
  SelectContent,
  SelectItem,
  SELECT_CARET_SLOT_DATA_ATTR,
  SELECT_SIZING_LABEL_DATA_ATTR,
  SELECT_VALUE_SLOT_DATA_ATTR,
  SelectTrigger,
  SelectValue,
} from './select.client'

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

function renderDigitSelect(
  props: {
    value?: string
    digits?: 1 | 2 | 3
    grouped?: boolean
    groupedPosition?: 'start' | 'end'
    label?: string
  } = {},
) {
  const {
    value = '8',
    digits = 2,
    grouped = false,
    groupedPosition = 'end',
    label = 'Faces',
  } = props

  return render(
    <Select value={value}>
      <SelectTrigger
        aria-label={label}
        size="md"
        digits={digits}
        grouped={grouped}
        groupedPosition={groupedPosition}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="8">8</SelectItem>
        <SelectItem value="9">9</SelectItem>
        <SelectItem value="30">30</SelectItem>
      </SelectContent>
    </Select>,
  )
}

function renderSizingLabelSelect(
  props: {
    value?: string
    sizingLabel?: string
    grouped?: boolean
    groupedPosition?: 'start' | 'end'
    label?: string
  } = {},
) {
  const {
    value = 'gp',
    sizingLabel = 'GP',
    grouped = false,
    groupedPosition = 'end',
    label = 'Currency',
  } = props

  return render(
    <Select value={value}>
      <SelectTrigger
        aria-label={label}
        size="md"
        sizingLabel={sizingLabel}
        grouped={grouped}
        groupedPosition={groupedPosition}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="cp">CP</SelectItem>
        <SelectItem value="sp">SP</SelectItem>
        <SelectItem value="gp">GP</SelectItem>
      </SelectContent>
    </Select>,
  )
}

function caretSlot(trigger: HTMLElement) {
  return trigger.querySelector(`[${SELECT_CARET_SLOT_DATA_ATTR}]`)
}

function valueSlot(trigger: HTMLElement) {
  return trigger.querySelector(`[${SELECT_VALUE_SLOT_DATA_ATTR}]`)
}

function sizingGhost(trigger: HTMLElement) {
  return trigger.querySelector(`[${SELECT_SIZING_LABEL_DATA_ATTR}]`)
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

  it('uses ValueSlot + CaretSlot anatomy without root horizontal padding', () => {
    renderDigitSelect()

    const trigger = screen.getByLabelText('Faces')
    expect(trigger).toHaveClass('px-0', 'py-0', 'w-auto', 'inline-flex')
    expect(trigger).not.toHaveClass('px-3', 'pe-2.5')

    const slot = valueSlot(trigger)
    expect(slot).toHaveClass('ps-3', 'pe-1', 'min-w-[calc(2*1ch)]', 'tabular-nums')
    expect(slot).toHaveTextContent('8')

    const caret = caretSlot(trigger)
    expect(caret).toHaveClass('w-8', 'self-stretch')
    expect(caret?.querySelector('svg')).toHaveClass('size-icon-glyph-lg')
  })

  it('applies grouped start caret inset without changing caret slot width', () => {
    renderDigitSelect({ grouped: true, groupedPosition: 'start', value: '30', digits: 2 })

    const trigger = screen.getByLabelText('Faces')
    expect(trigger).toHaveClass('w-auto')

    const caret = caretSlot(trigger)
    expect(caret).toHaveClass('w-8', 'pe-1')
  })

  it('omits grouped start caret inset on end segments', () => {
    renderDigitSelect({ grouped: true, groupedPosition: 'end', value: '30', digits: 2 })

    const caret = caretSlot(screen.getByLabelText('Faces'))
    expect(caret).toHaveClass('w-8')
    expect(caret).not.toHaveClass('pe-1')
  })

  it('keeps trigger width and caret slot position stable between 1- and 2-digit values', () => {
    const { rerender } = renderDigitSelect({ value: '9' })
    const trigger = screen.getByLabelText('Faces')
    const widthForOneDigit = trigger.getBoundingClientRect().width
    const columnLeftForOneDigit = caretSlot(trigger)?.getBoundingClientRect().left

    rerender(
      <Select value="30">
        <SelectTrigger aria-label="Faces" size="md" digits={2}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="9">9</SelectItem>
          <SelectItem value="30">30</SelectItem>
        </SelectContent>
      </Select>,
    )

    const nextTrigger = screen.getByLabelText('Faces')
    expect(nextTrigger).toHaveTextContent('30')
    expect(nextTrigger.getBoundingClientRect().width).toBe(widthForOneDigit)
    expect(caretSlot(nextTrigger)?.getBoundingClientRect().left).toBe(columnLeftForOneDigit)
  })

  it('reserves sizingLabel width from a hidden ghost label without clipping GP', () => {
    renderSizingLabelSelect({ value: 'gp', sizingLabel: 'GP' })

    const trigger = screen.getByLabelText('Currency')
    expect(trigger).toHaveTextContent('GP')
    expect(sizingGhost(trigger)).toHaveTextContent('GP')
    expect(sizingGhost(trigger)).toHaveAttribute('aria-hidden', 'true')
    expect(valueSlot(trigger)).toHaveClass('grid')
  })

  it('uses sizingLabel in the hidden ghost even when the selected value is shorter', () => {
    renderSizingLabelSelect({ value: 'gp', sizingLabel: 'Platinum' })

    const trigger = screen.getByLabelText('Currency')
    expect(trigger).toHaveTextContent('GP')
    expect(sizingGhost(trigger)).toHaveTextContent('Platinum')
    expect(sizingGhost(trigger)).toHaveClass('invisible', 'pointer-events-none')
  })

  it('updates the sizing ghost when sizingLabel changes without changing caret slot classes', () => {
    const { rerender } = render(
      <Select value="gp">
        <SelectTrigger aria-label="Currency" size="md" sizingLabel="GP">
          <SelectValue />
        </SelectTrigger>
      </Select>,
    )
    const trigger = screen.getByLabelText('Currency')
    expect(sizingGhost(trigger)).toHaveTextContent('GP')
    const caretClasses = caretSlot(trigger)?.className

    rerender(
      <Select value="gp">
        <SelectTrigger aria-label="Currency" size="md" sizingLabel="Platinum">
          <SelectValue />
        </SelectTrigger>
      </Select>,
    )

    const nextTrigger = screen.getByLabelText('Currency')
    expect(sizingGhost(nextTrigger)).toHaveTextContent('Platinum')
    expect(caretSlot(nextTrigger)?.className).toBe(caretClasses)
    expect(caretSlot(nextTrigger)).toHaveClass('w-8')
  })

  it('rejects digits and sizingLabel together', () => {
    expect(() =>
      render(
        <Select value="gp">
          <SelectTrigger aria-label="Invalid" size="md" digits={2} sizingLabel="GP">
            <SelectValue />
          </SelectTrigger>
        </Select>,
      ),
    ).toThrow('SelectTrigger: `digits`, `sizingLabel`, and `sizingLabels` are mutually exclusive.')
  })

  it('renders all sizingLabels as hidden ghosts', () => {
    render(
      <Select value="gp">
        <SelectTrigger aria-label="Currency" size="md" sizingLabels={['CP', 'GP', 'SP']}>
          <SelectValue />
        </SelectTrigger>
      </Select>,
    )

    const trigger = screen.getByLabelText('Currency')
    expect(trigger.querySelectorAll(`[${SELECT_SIZING_LABEL_DATA_ATTR}]`)).toHaveLength(3)
    expect(trigger).toHaveTextContent('GP')
  })

  it('supports sizingLabel on grouped composite triggers', () => {
    renderSizingLabelSelect({ grouped: true, groupedPosition: 'end', sizingLabel: 'GP' })

    const trigger = screen.getByLabelText('Currency')
    expect(trigger).toHaveClass('w-auto', 'p-0')
    expect(valueSlot(trigger)).toHaveClass('grid', 'ps-2')
    expect(caretSlot(trigger)).toHaveClass('w-8')
    expect(trigger).toHaveTextContent('GP')
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
    const inlineCaret = caretSlot(screen.getByLabelText('Inline'))?.querySelector('svg')
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
    const digitCaret = caretSlot(screen.getByLabelText('Digit'))?.querySelector('svg')
    expect(digitCaret).toHaveClass('size-icon-glyph-lg')
  })

  itAxe('has no axe accessibility violations (closed)', async () => {
    const { container } = renderSelect()
    await expectNoAxeViolations(container)
  })
})
