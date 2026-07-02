import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  buildLevelOptions,
  maxLevelSelectable,
  minLevelSelectable,
  type LevelRangeRow,
} from '@rpg/contracts'
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
    reorder: false,
    arrayPattern: { kind: 'levelRange', levelKeys: { min: 'minLevel', max: 'maxLevel' } },
    filterSelectOptions: ({ arrayItems, rowIndex, fieldName }) => {
      const rows = arrayItems as LevelRangeRow[]
      const row = rows[rowIndex]
      const rowMin = row?.minLevel ?? 1
      const effectiveMax = 20

      return buildLevelOptions(effectiveMax).map((option) => {
        const level = Number(option.value)
        const selectable =
          fieldName === 'minLevel'
            ? minLevelSelectable(rows, rowIndex, level, effectiveMax)
            : maxLevelSelectable(rows, rowIndex, level, rowMin, effectiveMax)

        return { ...option, disabled: !selectable }
      })
    },
    fields: [
      {
        type: 'levelRange',
        name: 'minLevel',
        label: 'Level range',
        required: true,
        options: buildLevelOptions(20),
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
