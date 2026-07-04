import { describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { InputSelectField, InputUnitField } from './input-select-field.client'

const options = [
  { label: 'GP', value: 'gp' },
  { label: 'SP', value: 'sp' },
  { label: 'CP', value: 'cp' },
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
    expect(screen.getByRole('combobox', { name: 'Cost unit' })).toHaveTextContent('SP')
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
    await userEvent.click(screen.getByRole('option', { name: /^SP$/i }))

    expect(onUnitChange).toHaveBeenCalledWith('sp')
  })

  it('shows search in the searchable panel and filters options', async () => {
    render(
      <ControlledField
        searchable
        options={[
          ...options,
          { label: 'PP', value: 'pp' },
          { label: 'Astral shard', value: 'shard', description: 'Planar currency' },
        ]}
      />,
    )

    await userEvent.click(screen.getByRole('combobox', { name: 'Cost unit' }))
    expect(screen.getByLabelText('Search Cost')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Search Cost'), 'pp')
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /^PP$/i })).toBeInTheDocument()
      expect(screen.queryByRole('option', { name: /^SP$/i })).not.toBeInTheDocument()
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
    expect(screen.getByRole('combobox', { name: 'Cost unit' })).toHaveClass('min-w-44')
  })

  it('uses intrinsic layout when valueDigits is set on a number field', () => {
    const { container } = render(<ControlledField valueDigits={2} width="auto" />)
    const group = container.querySelector('[role="group"]')
    expect(group).toHaveClass('w-fit')
    expect(group).toHaveClass('grid-cols-[auto_1px_auto]')
    expect(group).toHaveClass('items-center')

    const numberInputRoot = screen.getByLabelText('Cost value').parentElement
    expect(numberInputRoot).toHaveClass('w-[calc(2*1ch+2.75rem)]')
  })

  it('applies five-digit intrinsic width without w-full on the root', () => {
    const { container } = render(<ControlledField valueDigits={5} width="auto" />)
    const numberInputRoot = screen.getByLabelText('Cost value').parentElement
    expect(numberInputRoot).toHaveClass('w-[calc(5*1ch+2.75rem)]')
    expect(numberInputRoot).not.toHaveClass('w-full')

    const group = container.querySelector('[role="group"]')
    expect(group).toHaveClass('w-fit')
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

  it('wires the visible label through Field.Label for row alignment', () => {
    render(<ControlledField required />)
    const label = screen.getByText('Cost').closest('label')
    expect(label).toHaveAttribute('id', 'cost-label')
    expect(label).toHaveAttribute('for', 'cost-value')
    expect(label).not.toHaveAttribute('for', 'cost')
  })

  it('disables only the unit segment when unitDisabled is true', () => {
    render(
      <ControlledField
        unitDisabled
        options={[{ label: 'lb.', value: 'lb' }]}
        initialUnit="lb"
        unit="lb"
      />,
    )
    expect(screen.getByLabelText('Cost value')).not.toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Cost unit' })).toBeDisabled()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<ControlledField min={0} />)
    await expectNoAxeViolations(container)
  })

  it('renders a static unit label without a combobox when unitMode is label', () => {
    const { container } = render(
      <ControlledField
        unitMode="label"
        fixedUnit="ft."
        options={[]}
        onUnitChange={undefined}
        width="auto"
        valueDigits={2}
      />,
    )

    expect(screen.queryByRole('combobox', { name: 'Cost unit' })).not.toBeInTheDocument()
    expect(screen.getByText('ft.')).toBeInTheDocument()

    const unitLabel = container.querySelector('[aria-hidden].rounded-r-md')
    expect(unitLabel).toHaveTextContent('ft.')
    expect(unitLabel).not.toHaveClass('min-w-[5rem]')
  })

  it('uses intrinsic grouped layout for label mode with valueDigits', () => {
    const { container } = render(
      <ControlledField unitMode="label" fixedUnit="ft." valueDigits={2} width="auto" />,
    )
    const group = container.querySelector('[role="group"]')
    expect(group).toHaveClass('w-fit', 'items-center', 'grid-cols-[auto_1px_auto]')
    expect(screen.getByLabelText('Cost value')).toHaveClass('h-9')
  })
})

function ControlledUnitField(
  props: Partial<React.ComponentProps<typeof InputUnitField>> & { initialValue?: number },
) {
  const { initialValue = 30, ...rest } = props
  const [value, setValue] = React.useState<number | undefined>(initialValue)

  return (
    <InputUnitField
      id="walk-speed"
      label="Walk speed"
      inputType="number"
      unit="ft."
      value={value}
      onValueChange={(next) => setValue(typeof next === 'number' ? next : undefined)}
      min={0}
      width="auto"
      valueDigits={2}
      {...rest}
    />
  )
}

describe('InputUnitField', () => {
  it('renders a grouped value input and static unit label', () => {
    render(<ControlledUnitField />)
    expect(screen.getByLabelText('Walk speed value')).toHaveAttribute('id', 'walk-speed-value')
    expect(screen.getByText('ft.')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('wires Field.Label htmlFor to the value input', () => {
    render(<ControlledUnitField required />)
    const label = screen.getByText('Walk speed').closest('label')
    expect(label).toHaveAttribute('for', 'walk-speed-value')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<ControlledUnitField />)
    await expectNoAxeViolations(container)
  })
})
