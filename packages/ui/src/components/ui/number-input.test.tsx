import { describe, expect, it } from 'vitest'
import * as React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

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

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <NumberInput aria-label="Count" defaultValue={3} min={1} max={10} />,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
