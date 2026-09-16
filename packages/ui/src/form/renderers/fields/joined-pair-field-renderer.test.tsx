import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { Form } from '../../shells/form.client'
import type { FormItem } from '../../field-config'

const movementRowSchema = z.object({
  mode: z.string().min(1),
  feet: z.coerce.number().min(1),
})

const movementFields: FormItem[] = [
  {
    kind: 'array',
    name: 'movement',
    legend: 'Movement',
    addAction: { label: 'Add movement' },
    fields: [
      {
        kind: 'row',
        fields: [
          {
            type: 'select',
            name: 'mode',
            label: 'Mode',
            required: true,
            options: [{ value: 'walk', label: 'Walk' }],
            defaultValue: 'walk',
          },
          {
            type: 'joinedPair',
            label: 'Speed',
            required: true,
            start: {
              kind: 'select',
              name: 'feet',
              options: [
                { value: 30, label: '30' },
                { value: 60, label: '60' },
              ],
              defaultValue: 30,
              digits: 3,
              ariaLabel: 'Speed value',
            },
            end: {
              kind: 'label',
              text: 'ft.',
              ariaLabel: 'Speed unit',
            },
          },
        ],
      },
    ],
  },
]

const senseRangeFields: FormItem[] = [
  {
    type: 'joinedPair',
    label: 'Range',
    width: '1/3',
    start: {
      kind: 'select',
      name: 'senseRange',
      options: [
        { value: 60, label: '60' },
        { value: 120, label: '120' },
      ],
      digits: 3,
      defaultValue: 60,
      ariaLabel: 'Range',
    },
    end: {
      kind: 'label',
      text: 'ft.',
      ariaLabel: 'Range unit',
    },
  },
]

describe('JoinedPairFieldRenderer', () => {
  it('renders the stored numeric select value for grant-style range fields', () => {
    render(
      <Form
        schema={z.object({ senseRange: z.coerce.number() })}
        fields={senseRangeFields}
        defaultValues={{ senseRange: 120 }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Range' })).toHaveTextContent('120')
  })

  it('shows Speed label error and highlights the start select when feet is invalid', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      movement: z.array(movementRowSchema),
    })

    render(
      <Form
        schema={schema}
        fields={movementFields}
        defaultValues={{ movement: [{ mode: 'walk', feet: 0 }] }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('alert')).toHaveTextContent(/at least 1/i)
    expect(screen.getByRole('combobox', { name: 'Speed value' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('surfaces feet path errors on the Speed group and start select', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <Form
        schema={z.object({
          movement: z.array(
            z.object({
              mode: z.string(),
              feet: z.number().refine((value) => value === 99, 'Choose 99 feet.'),
            }),
          ),
        })}
        fields={movementFields}
        defaultValues={{ movement: [{ mode: 'walk', feet: 30 }] }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Choose 99 feet.')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Speed value' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })
})
