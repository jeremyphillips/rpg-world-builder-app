import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { Form } from './form.client'
import type { FormItem } from './field-config'
import {
  DEFAULT_DICE_FORMULA_VALUE,
  DEFAULT_DICE_FORMULA_WITH_MODIFIER,
} from '../components/ui/dice-formula-field.lib'

const schema = z.object({
  roll: z.object({
    count: z.number().int().min(1),
    faces: z.number().int(),
    modifier: z
      .object({
        operator: z.enum(['+', '-']),
        amount: z.number().int().min(0),
      })
      .optional(),
  }),
})

function renderDiceFormulaForm(fields: FormItem[], onSubmit = vi.fn()) {
  return render(
    <Form
      schema={schema}
      fields={fields}
      onSubmit={onSubmit}
      footer={<button type="submit">Save</button>}
    />,
  )
}

describe('Form diceFormula field', () => {
  it('submits optional-mode defaults as 1d6', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const fields: FormItem[] = [
      {
        type: 'diceFormula',
        name: 'roll',
        label: 'Roll',
        modifierMode: 'optional',
      },
    ]

    renderDiceFormulaForm(fields, onSubmit)
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.lastCall?.[0]).toEqual({ roll: DEFAULT_DICE_FORMULA_VALUE })
  })

  it('submits required-mode defaults as 1d6+1', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const fields: FormItem[] = [
      {
        type: 'diceFormula',
        name: 'roll',
        label: 'Roll',
        modifierMode: 'required',
      },
    ]

    renderDiceFormulaForm(fields, onSubmit)
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.lastCall?.[0]).toEqual({ roll: DEFAULT_DICE_FORMULA_WITH_MODIFIER })
  })

  it('round-trips optional modifier add/remove through submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const fields: FormItem[] = [
      {
        type: 'diceFormula',
        name: 'roll',
        label: 'Roll',
        modifierMode: 'optional',
      },
    ]

    renderDiceFormulaForm(fields, onSubmit)

    await user.click(screen.getByRole('button', { name: 'Add modifier' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.lastCall?.[0]).toEqual({
      roll: { count: 1, faces: 6, modifier: { operator: '+', amount: 1 } },
    })

    await user.click(screen.getByRole('button', { name: 'Remove modifier' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2))
    expect(onSubmit.mock.lastCall?.[0]).toEqual({ roll: DEFAULT_DICE_FORMULA_VALUE })
  })
})
