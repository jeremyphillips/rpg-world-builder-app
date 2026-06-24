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
          { value: 'cp', label: 'Copper' },
          { value: 'sp', label: 'Silver' },
          { value: 'gp', label: 'Gold' },
          { value: 'pp', label: 'Platinum' },
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
          { value: 'cp', label: 'Copper' },
          { value: 'sp', label: 'Silver' },
          { value: 'gp', label: 'Gold' },
          { value: 'pp', label: 'Platinum' },
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
        options: [{ value: 'gp', label: 'Gold' }],
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
    expect(numberInputRoot).toHaveClass('w-[calc(3ch+3.125rem)]')

    const group = container.querySelector('[role="group"]')
    expect(group).toHaveClass('w-fit')
  })
})
