import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { Form } from './form.client'
import type { FormItem } from './field-config'

const walkSpeedSchema = z.object({
  speed: z.object({
    walk: z.coerce.number().int().min(0),
  }),
})

const rangeSchema = z.object({
  range: z.coerce.number().int().min(0).optional(),
})

describe('Form inputUnit field', () => {
  it('submits a scalar number bound to a dotted path', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const fields: FormItem[] = [
      {
        type: 'inputUnit',
        name: 'range',
        label: 'Range',
        inputType: 'number',
        unit: 'ft.',
        min: 0,
        valueDigits: 3,
        defaultValue: 60,
      },
    ]

    render(
      <Form
        schema={rangeSchema}
        fields={fields}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByText('ft.')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.lastCall?.[0]).toEqual({ range: 60 })
  })

  it('round-trips scalar value edits through submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const fields: FormItem[] = [
      {
        type: 'inputUnit',
        name: 'speed.walk',
        label: 'Walk speed',
        inputType: 'number',
        unit: 'ft.',
        min: 0,
        valueDigits: 2,
        defaultValue: 30,
      },
    ]

    render(
      <Form
        schema={walkSpeedSchema}
        fields={fields}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    const input = screen.getByLabelText('Walk speed value')
    fireEvent.change(input, { target: { value: '35' } })

    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.lastCall?.[0]).toEqual({ speed: { walk: 35 } })
  })

  it('resolves valueDigits from a watched field', () => {
    const fields: FormItem[] = [
      {
        type: 'select',
        name: 'kind',
        label: 'Kind',
        options: [
          { value: 'short', label: 'Short' },
          { value: 'long', label: 'Long' },
        ],
        defaultValue: 'short',
      },
      {
        type: 'inputUnit',
        name: 'range',
        label: 'Range',
        inputType: 'number',
        unit: 'ft.',
        valueDigitsDependsOn: 'kind',
        valueDigitsLookup: { short: 2, long: 3 },
        defaultValue: 30,
      },
    ]

    render(
      <Form
        schema={z.object({
          kind: z.enum(['short', 'long']),
          range: z.coerce.number().optional(),
        })}
        fields={fields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByLabelText('Range value').parentElement).toHaveClass(
      'w-[calc(2*1ch+2.75rem)]',
    )
  })

  it('seeds defaults when a conditional inputUnit becomes visible', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      showRange: z.boolean(),
      range: z.coerce.number().int().min(0).optional(),
    })

    const fields: FormItem[] = [
      { type: 'switch', name: 'showRange', label: 'Has range' },
      {
        type: 'inputUnit',
        name: 'range',
        label: 'Range',
        inputType: 'number',
        unit: 'ft.',
        min: 0,
        valueDigits: 3,
        defaultValue: 120,
        visibility: {
          dependsOn: ['showRange'],
          visibleWhen: (values) => values.showRange === true,
        },
      },
    ]

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ showRange: false, range: 120 }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.queryByLabelText('Range value')).not.toBeInTheDocument()

    await user.click(screen.getByLabelText('Has range'))
    expect(screen.getByLabelText('Range value')).toHaveValue(120)
    expect(screen.getByText('ft.')).toBeInTheDocument()
  })
})
