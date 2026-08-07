import { describe, expect, it } from 'vitest'
import * as React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { NumberInput } from './number-input.client'

describe('NumberInput', () => {
  it('renders a numeric input without native spin buttons styling classes', () => {
    render(<NumberInput aria-label="Count" defaultValue={3} />)
    const input = screen.getByLabelText('Count')
    expect(input).toHaveAttribute('type', 'number')
    expect(input).toHaveAttribute('inputmode', 'numeric')
    expect(input).toHaveClass('[appearance:textfield]')
  })

  it('shows stepper controls on focus within the field', () => {
    render(<NumberInput aria-label="Count" defaultValue={3} />)
    const steppers = screen.getByLabelText('Increment').closest('div')
    expect(steppers).toHaveClass('opacity-0')
    expect(steppers).toHaveClass('group-focus-within:opacity-100')

    fireEvent.focus(screen.getByLabelText('Count'))
    expect(steppers).toHaveClass('group-focus-within:opacity-100')
  })

  it('increments and decrements via stepper buttons', async () => {
    function Harness() {
      const [value, setValue] = React.useState(5)
      return (
        <NumberInput
          aria-label="Count"
          value={value}
          min={1}
          max={10}
          onChange={(event) => setValue(Number(event.target.value))}
        />
      )
    }

    render(<Harness />)

    await userEvent.click(screen.getByLabelText('Increment'))
    expect(screen.getByLabelText('Count')).toHaveValue(6)

    await userEvent.click(screen.getByLabelText('Decrement'))
    expect(screen.getByLabelText('Count')).toHaveValue(5)
  })

  it('disables steppers at bounds', () => {
    render(<NumberInput aria-label="Count" defaultValue={10} min={1} max={10} />)
    expect(screen.getByLabelText('Increment')).toBeDisabled()
    expect(screen.getByLabelText('Decrement')).not.toBeDisabled()
  })

  it('uses stepperMin and stepperMax without HTML bounds', () => {
    render(<NumberInput aria-label="Count" defaultValue={10} stepperMin={1} stepperMax={10} />)
    const input = screen.getByLabelText('Count')
    expect(input).not.toHaveAttribute('min')
    expect(input).not.toHaveAttribute('max')
    expect(screen.getByLabelText('Increment')).toBeDisabled()
  })

  it('hides steppers when disabled', () => {
    render(<NumberInput aria-label="Count" defaultValue={3} disabled />)
    expect(screen.getByLabelText('Increment').closest('div')).toHaveClass('hidden')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <NumberInput aria-label="Count" defaultValue={3} min={1} max={10} />,
    )
    await expectNoAxeViolations(container)
  })

  describe('formatGrouped', () => {
    it('renders a text input with decimal input mode', () => {
      render(<NumberInput aria-label="Cost" formatGrouped value={3000} onChange={() => {}} />)
      const input = screen.getByLabelText('Cost')
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveAttribute('inputmode', 'decimal')
      expect(input).toHaveValue('3,000')
    })

    it('formats while typing and removes grouping when value drops below 1,000', async () => {
      function Harness() {
        const [value, setValue] = React.useState<number | undefined>(undefined)
        return (
          <NumberInput
            aria-label="Cost"
            formatGrouped
            value={value}
            onChange={(event) => {
              const next = event.target.value
              setValue(next === '' ? undefined : Number(next))
            }}
          />
        )
      }

      render(<Harness />)
      const input = screen.getByLabelText('Cost')

      await userEvent.type(input, '3000')
      expect(input).toHaveValue('3,000')

      await userEvent.type(input, '{Backspace}')
      expect(input).toHaveValue('300')
    })

    it('increments grouped values through steppers', async () => {
      function Harness() {
        const [value, setValue] = React.useState(999)
        return (
          <NumberInput
            aria-label="Cost"
            formatGrouped
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
          />
        )
      }

      render(<Harness />)
      const input = screen.getByLabelText('Cost')
      expect(input).toHaveValue('999')

      await userEvent.click(screen.getByLabelText('Increment'))
      expect(input).toHaveValue('1,000')
    })
  })
})
