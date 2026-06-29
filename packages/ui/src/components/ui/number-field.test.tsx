import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { NumberField } from './number-field'

describe('NumberField', () => {
  it('renders a numeric input with min/max and custom steppers', () => {
    render(<NumberField id="count" label="Count" min={1} max={20} />)
    const input = screen.getByLabelText('Count')
    expect(input).toHaveAttribute('type', 'number')
    expect(input).toHaveAttribute('inputmode', 'numeric')
    expect(input).toHaveAttribute('min', '1')
    expect(input).toHaveAttribute('max', '20')
    expect(screen.getByLabelText('Increment')).toBeInTheDocument()
    expect(screen.getByLabelText('Decrement')).toBeInTheDocument()
  })

  it('renders the error and marks the input invalid', () => {
    render(<NumberField id="count" label="Count" error="Too low." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Too low.')
    expect(screen.getByLabelText('Count')).toHaveAttribute('aria-invalid', 'true')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<NumberField id="count" label="Count" />)
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })

  it('renders a settings-row layout when labelPosition is settings', () => {
    render(
      <NumberField
        id="score"
        label="Minimum ability score"
        hint="Applied to every primary ability."
        labelPosition="settings"
        digits={2}
        defaultValue={13}
      />,
    )
    const input = screen.getByLabelText('Minimum ability score')
    expect(input.closest('.grid')).toHaveClass('sm:grid-cols-[minmax(0,1fr)_auto]')
    expect(screen.getByText('Applied to every primary ability.')).toBeInTheDocument()
  })

  it('has no axe accessibility violations with settings layout', async () => {
    const { container } = render(
      <NumberField
        id="score"
        label="Minimum ability score"
        hint="Applied to every primary ability."
        labelPosition="settings"
        digits={2}
      />,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
