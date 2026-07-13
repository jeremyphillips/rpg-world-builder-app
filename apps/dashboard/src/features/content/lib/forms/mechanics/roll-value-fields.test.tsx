import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { Form } from '@rpg/ui/form'

import { rollValueFields } from './roll-value-fields'

const schema = z.object({
  roll: z
    .object({
      dice: z
        .object({
          count: z.coerce.number().int().optional(),
          faces: z.coerce.number().int().optional(),
        })
        .optional(),
      flatOperator: z.enum(['+', '-']).optional(),
      flatAmount: z.coerce.number().int().min(0).optional(),
    })
    .optional(),
})

describe('rollValueFields', () => {
  it('binds dice count, faces, operator, and amount to RollValue paths', () => {
    const fields = rollValueFields({ namePrefix: 'damage' })
    const inlineSentence = fields.find(
      (field) => !('kind' in field) && field.type === 'inlineSentence',
    )

    expect(inlineSentence).toMatchObject({
      name: 'damage',
      type: 'inlineSentence',
      segments: [
        expect.objectContaining({
          kind: 'number',
          name: 'damage.dice.count',
          digits: 2,
        }),
        { kind: 'text', value: 'd', tone: 'mono' },
        expect.objectContaining({
          kind: 'select',
          name: 'damage.dice.faces',
          digits: 3,
        }),
        expect.objectContaining({
          kind: 'select',
          name: 'damage.flatOperator',
          defaultValue: '+',
        }),
        expect.objectContaining({
          kind: 'number',
          name: 'damage.flatAmount',
          digits: 3,
          defaultValue: 0,
        }),
      ],
    })
  })

  it('always renders flat operator and amount with defaults', () => {
    render(
      <Form
        schema={schema}
        fields={rollValueFields({ namePrefix: 'roll', label: 'Damage roll' })}
        defaultValues={{
          roll: { dice: { count: 1, faces: 6 } },
        }}
        onSubmit={() => undefined}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Flat sign' })).toHaveTextContent('+')
    expect(screen.getByRole('spinbutton', { name: 'Flat modifier' })).toHaveValue(0)
  })

  it('renders existing dice and flat values on mount', () => {
    render(
      <Form
        schema={schema}
        fields={rollValueFields({ namePrefix: 'roll', label: 'Damage roll' })}
        defaultValues={{
          roll: {
            dice: { count: 1, faces: 10 },
            flatOperator: '+',
            flatAmount: 1,
          },
        }}
        onSubmit={() => undefined}
      />,
    )

    expect(screen.getByRole('spinbutton', { name: 'Dice count' })).toHaveValue(1)
    expect(screen.getByRole('combobox', { name: 'Die faces' })).toHaveTextContent('10')
    expect(screen.getByRole('combobox', { name: 'Flat sign' })).toHaveTextContent('+')
    expect(screen.getByRole('spinbutton', { name: 'Flat modifier' })).toHaveValue(1)
  })
})
