import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { Form } from './form.client'
import type { FormItem } from './field-config'

const costSchema = z.object({
  cost: z.object({
    amount: z.coerce.number().int().min(0),
    currency: z.enum(['cp', 'sp', 'gp', 'pp']),
  }),
})

const kindCostSchema = costSchema.extend({
  kind: z.enum(['weapon', 'vehicle']),
})

function renderInputSelectForm(fields: FormItem[], onSubmit = vi.fn()) {
  return render(
    <Form
      schema={costSchema}
      fields={fields}
      onSubmit={onSubmit}
      footer={<button type="submit">Save</button>}
    />,
  )
}

describe('Form inputSelect field', () => {
  it('submits nested amount and currency from defaults', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const fields: FormItem[] = [
      {
        type: 'inputSelect',
        name: 'cost',
        label: 'Cost',
        inputType: 'number',
        valueKey: 'amount',
        unitKey: 'currency',
        options: [
          { value: 'cp', label: 'CP' },
          { value: 'sp', label: 'SP' },
          { value: 'gp', label: 'GP' },
          { value: 'pp', label: 'PP' },
        ],
        min: 0,
        defaultValue: { amount: 15, currency: 'gp' },
      },
    ]

    renderInputSelectForm(fields, onSubmit)
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.lastCall?.[0]).toEqual({ cost: { amount: 15, currency: 'gp' } })
  })

  it('round-trips value and unit edits through submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const fields: FormItem[] = [
      {
        type: 'inputSelect',
        name: 'cost',
        label: 'Cost',
        inputType: 'number',
        valueKey: 'amount',
        unitKey: 'currency',
        options: [
          { value: 'cp', label: 'CP' },
          { value: 'sp', label: 'SP' },
          { value: 'gp', label: 'GP' },
          { value: 'pp', label: 'PP' },
        ],
        min: 0,
        defaultValue: { amount: 0, currency: 'gp' },
      },
    ]

    renderInputSelectForm(fields, onSubmit)

    const input = screen.getByLabelText('Cost value')
    await user.clear(input)
    await user.type(input, '25')

    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.lastCall?.[0]).toEqual({ cost: { amount: 25, currency: 'gp' } })
  })

  it('resolves valueDigits from a watched kind field', () => {
    const onSubmit = vi.fn()
    const fields: FormItem[] = [
      {
        type: 'select',
        name: 'kind',
        label: 'Kind',
        options: [
          { value: 'weapon', label: 'Weapon' },
          { value: 'vehicle', label: 'Vehicle' },
        ],
        defaultValue: 'weapon',
      },
      {
        type: 'inputSelect',
        name: 'cost',
        label: 'Cost',
        inputType: 'number',
        valueKey: 'amount',
        unitKey: 'currency',
        options: [{ value: 'gp', label: 'GP' }],
        valueDigitsDependsOn: 'kind',
        valueDigitsLookup: { weapon: 3, vehicle: 5 },
        defaultValue: { amount: 0, currency: 'gp' },
      },
    ]

    const { container } = render(
      <Form
        schema={kindCostSchema}
        fields={fields}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    const numberInputRoot = screen.getByLabelText('Cost value').parentElement
    expect(numberInputRoot).toHaveClass('w-[calc(3*1ch+2.75rem)]')

    const group = container.querySelector('[role="group"]')
    expect(group).toHaveClass('w-fit')
  })

  it('disables only the unit segment when unitDisabled is true', () => {
    const onSubmit = vi.fn()
    const fields: FormItem[] = [
      {
        type: 'inputSelect',
        name: 'weight',
        label: 'Weight',
        inputType: 'number',
        options: [{ value: 'lb', label: 'lb.' }],
        unitDisabled: true,
        defaultValue: { value: 3, unit: 'lb' },
      },
    ]

    render(
      <Form
        schema={z.object({
          weight: z.object({ value: z.coerce.number().optional(), unit: z.literal('lb') }),
        })}
        fields={fields}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByLabelText('Weight value')).not.toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Weight unit' })).toBeDisabled()
  })

  it('stores plain numbers while displaying grouped cost values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const fields: FormItem[] = [
      {
        type: 'inputSelect',
        name: 'cost',
        label: 'Cost',
        inputType: 'number',
        valueKey: 'amount',
        unitKey: 'currency',
        options: [{ value: 'gp', label: 'GP' }],
        formatGrouped: true,
        min: 0,
        defaultValue: { amount: 0, currency: 'gp' },
      },
    ]

    renderInputSelectForm(fields, onSubmit)

    const input = screen.getByLabelText('Cost value')
    await user.type(input, '3000')
    expect(input).toHaveValue('3,000')

    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.lastCall?.[0]).toEqual({ cost: { amount: 3000, currency: 'gp' } })
  })

  it('seeds value and unit defaults when a conditional inputSelect becomes visible', async () => {
    const user = userEvent.setup()
    const durationSchema = z.object({
      showTimed: z.boolean(),
      duration: z.object({
        value: z.coerce.number().int().min(1),
        unit: z.enum(['round', 'minute']),
      }),
    })

    const fields: FormItem[] = [
      { type: 'switch', name: 'showTimed', label: 'Timed duration' },
      {
        type: 'inputSelect',
        name: 'duration',
        label: 'Duration',
        inputType: 'number',
        valueKey: 'value',
        unitKey: 'unit',
        options: [
          { value: 'round', label: 'Round' },
          { value: 'minute', label: 'Minute' },
        ],
        min: 1,
        defaultValue: { value: 1, unit: 'round' },
        visibility: {
          dependsOn: ['showTimed'],
          visibleWhen: (values) => values.showTimed === true,
        },
      },
    ]

    render(
      <Form
        schema={durationSchema}
        fields={fields}
        defaultValues={{ showTimed: false, duration: { value: 1, unit: 'round' } }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.queryByLabelText('Duration value')).not.toBeInTheDocument()

    await user.click(screen.getByLabelText('Timed duration'))

    expect(screen.getByLabelText('Duration value')).toHaveValue(1)
    expect(screen.getByRole('combobox', { name: 'Duration unit' })).toHaveTextContent('Round')
  })
})
