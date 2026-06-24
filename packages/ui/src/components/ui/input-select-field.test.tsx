import { describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { InputSelectField } from './input-select-field.client'

const options = [
  { label: 'Gold', value: 'gp' },
  { label: 'Silver', value: 'sp' },
  { label: 'Copper', value: 'cp' },
]

function ControlledField(
  props: Partial<React.ComponentProps<typeof InputSelectField>> & {
    initialValue?: number
    initialUnit?: string
  },
) {
  const { initialValue = 10, initialUnit = 'gp', ...rest } = props
  const [value, setValue] = React.useState<number | undefined>(initialValue)
  const [unit, setUnit] = React.useState(initialUnit)

  return (
    <InputSelectField
      id="cost"
      label="Cost"
      inputType="number"
      options={options}
      value={value}
      unit={unit}
      onValueChange={(next) => setValue(typeof next === 'number' ? next : undefined)}
      onUnitChange={setUnit}
      {...rest}
    />
  )
}

describe('InputSelectField', () => {
  it('renders a grouped value input and unit select', () => {
    render(<ControlledField />)
    expect(screen.getByLabelText('Cost value')).toHaveAttribute('id', 'cost-value')
    expect(screen.getByRole('combobox', { name: 'Cost unit' })).toBeInTheDocument()
  })

  it('shows the selected unit label in the default select', () => {
    render(<ControlledField unit="sp" initialUnit="sp" />)
    expect(screen.getByRole('combobox', { name: 'Cost unit' })).toHaveTextContent('Silver')
  })

  it('calls onValueChange when the value input changes', async () => {
    const onValueChange = vi.fn()
    render(<ControlledField onValueChange={onValueChange} />)

    const input = screen.getByLabelText('Cost value')
    await userEvent.clear(input)
    await userEvent.type(input, '25')

    expect(onValueChange).toHaveBeenCalled()
  })

  it('calls onUnitChange when a searchable unit is selected', async () => {
    const onUnitChange = vi.fn()
    render(<ControlledField searchable onUnitChange={onUnitChange} unit="gp" />)

    await userEvent.click(screen.getByRole('combobox', { name: 'Cost unit' }))
    await userEvent.click(screen.getByRole('option', { name: /Silver/i }))

    expect(onUnitChange).toHaveBeenCalledWith('sp')
  })

  it('shows search in the searchable panel and filters options', async () => {
    render(
      <ControlledField
        searchable
        options={[
          ...options,
          { label: 'Platinum', value: 'pp' },
          { label: 'Astral shard', value: 'shard', description: 'Planar currency' },
        ]}
      />,
    )

    await userEvent.click(screen.getByRole('combobox', { name: 'Cost unit' }))
    expect(screen.getByLabelText('Search Cost')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Search Cost'), 'plat')
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Platinum/i })).toBeInTheDocument()
      expect(screen.queryByRole('option', { name: /Silver/i })).not.toBeInTheDocument()
    })
  })

  it('renders number steppers for numeric fields', () => {
    render(<ControlledField />)
    expect(screen.getByLabelText('Increment')).toBeInTheDocument()
    expect(screen.getByLabelText('Decrement')).toBeInTheDocument()
  })

  it('marks only the value segment invalid when error is set', () => {
    const { container } = render(<ControlledField error="Too low." />)
    const group = container.querySelector('[role="group"]')
    expect(group).toHaveClass('border-destructive')

    const valueSegments = container.querySelectorAll('[data-input-select-value]')
    expect(valueSegments).toHaveLength(1)

    expect(screen.getByLabelText('Cost value')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('combobox', { name: 'Cost unit' })).not.toHaveAttribute('aria-invalid')
    expect(screen.getByRole('alert')).toHaveTextContent('Too low.')
  })

  it('uses a wider unit trigger when searchable', () => {
    render(<ControlledField searchable />)
    expect(screen.getByRole('combobox', { name: 'Cost unit' })).toHaveClass('min-w-48')
  })

  it('uses intrinsic layout when valueDigits is set on a number field', () => {
    const { container } = render(<ControlledField valueDigits={2} width="auto" />)
    const group = container.querySelector('[role="group"]')
    expect(group).toHaveClass('w-fit')
    expect(group).toHaveClass('grid-cols-[auto_1px_auto]')

    const numberInputRoot = screen.getByLabelText('Cost value').parentElement
    expect(numberInputRoot).toHaveClass('w-[calc(2ch+3.125rem)]')
  })

  it('uses stretch layout for text fields', () => {
    const { container } = render(
      <InputSelectField
        id="label-text"
        label="Label text"
        inputType="text"
        options={options}
        value="Example"
        unit="left"
        onValueChange={() => {}}
        onUnitChange={() => {}}
        width="full"
      />,
    )
    const group = container.querySelector('[role="group"]')
    expect(group).toHaveClass('w-full')
    expect(group).toHaveClass('grid-cols-[1fr_1px_auto]')
  })

  it('shows a single required marker via label styling', () => {
    render(<ControlledField required />)
    const label = screen.getByText('Cost').closest('label')
    expect(label).toHaveAttribute('data-required')
    expect(label?.querySelector('span.text-destructive')).toBeNull()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<ControlledField min={0} />)
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
