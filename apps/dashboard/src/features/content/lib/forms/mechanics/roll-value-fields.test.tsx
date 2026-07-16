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
  it('emits a rollValue field bound to the roll object path', () => {
    const fields = rollValueFields({ namePrefix: 'damage' })

    expect(fields).toEqual([
      {
        type: 'rollValue',
        name: 'damage',
        label: 'Roll',
        width: 'auto',
      },
    ])
  })

  it('renders dice-only defaults without flat modifier controls', () => {
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

    expect(screen.getByLabelText('Number of dice')).toHaveValue(1)
    expect(screen.queryByLabelText('Modifier sign')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add modifier' })).toBeInTheDocument()
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

    expect(screen.getByLabelText('Number of dice')).toHaveValue(1)
    expect(screen.getByLabelText('Die size')).toBeInTheDocument()
    expect(screen.getByLabelText('Modifier sign')).toBeInTheDocument()
    expect(screen.getByLabelText('Flat modifier value')).toHaveValue(1)
  })
})
