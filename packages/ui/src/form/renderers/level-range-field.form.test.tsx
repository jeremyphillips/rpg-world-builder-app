import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'

const schema = z.object({
  tiers: z.array(
    z.object({
      minLevel: z.number(),
      maxLevel: z.number(),
    }),
  ),
})

type Values = z.infer<typeof schema>

const fields: FormItem[] = [
  {
    kind: 'array',
    name: 'tiers',
    legend: 'Tiers',
    allowReorder: false,
    fields: [
      {
        type: 'levelRange',
        name: 'minLevel',
        label: 'Level range',
        required: true,
        options: [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
        ],
      },
    ],
  },
]

describe('LevelRangeField form integration', () => {
  it('submits tier level range values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <Form<Values>
        schema={schema}
        fields={fields}
        defaultValues={{ tiers: [{ minLevel: 1, maxLevel: 4 }] }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith(
      { tiers: [{ minLevel: 1, maxLevel: 4 }] },
      expect.anything(),
    )
  })
})
