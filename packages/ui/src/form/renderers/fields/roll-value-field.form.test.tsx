import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, vi } from 'vitest'
import { z } from 'zod'

import { Form } from '../../shells/form.client'
import type { FormItem } from '../../field-config'
import { submitAndExpectPayload } from '../../test-utils'

const schema = z.object({
  damage: z.object({
    dice: z
      .object({
        count: z.coerce.number().int().optional(),
        faces: z.coerce.number().int().optional(),
      })
      .optional(),
    flatOperator: z.enum(['+', '-']).optional(),
    flatAmount: z.coerce.number().int().min(0).optional(),
  }),
})

const fields: FormItem[] = [
  {
    type: 'rollValue',
    name: 'damage',
    label: 'Damage roll',
    width: 'auto',
  },
]

describe('Form rollValue field', () => {
  it('binds nested roll paths and optional flat modifier defaults', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ damage: { dice: { count: 1, faces: 8 } } }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add modifier' }))
    await submitAndExpectPayload(user, onSubmit, {
      damage: {
        dice: { count: 1, faces: 8 },
        flatOperator: '+',
        flatAmount: 0,
      },
    })
  })
})
