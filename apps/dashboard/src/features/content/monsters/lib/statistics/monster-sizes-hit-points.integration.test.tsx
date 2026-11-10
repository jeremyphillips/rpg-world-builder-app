import { z } from 'zod'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form, type FormItem } from '@rpg/ui/form'
import { describe, expect, it, vi } from 'vitest'

import { createCreatureSizesFieldConfig } from '../../../lib/forms/fields/creature-sizes-form-fields'
import { monsterHitPointsFields } from './monster-hit-points-form-fields'
import { buildMonsterHitPointsFormValueSyncs } from './monster-hit-points-form.lib'

const sizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

const schema = z.object({
  sizes: z.array(z.string()),
  hitPointsUseFixed: z.boolean().optional(),
  hitPointsDice: z.object({ count: z.number(), faces: z.number() }).optional(),
  'hitPointsDice.count': z.number().optional(),
  'hitPointsDice.faces': z.string().optional(),
  hitPoints: z.object({ kind: z.string(), count: z.number().optional() }).optional(),
  abilityScores: z.record(z.string(), z.number()).optional(),
})

describe('monster sizes and hit points integration', () => {
  it('allows clearing the only selected size without infinite updates', async () => {
    const user = userEvent.setup()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const fields: FormItem[] = [
      {
        kind: 'group',
        fields: [
          createCreatureSizesFieldConfig({
            hint: 'Select sizes',
            options: sizeOptions,
          }),
          ...monsterHitPointsFields(),
        ],
      },
    ]

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{
          sizes: ['medium'],
          hitPointsUseFixed: false,
          hitPoints: { kind: 'hit-dice', count: 1 },
          'hitPointsDice.count': 1,
          'hitPointsDice.faces': '8',
          hitPointsDice: { count: 1, faces: 8 },
          abilityScores: {
            str: 10,
            dex: 10,
            con: 10,
            int: 10,
            wis: 10,
            cha: 10,
          },
        }}
        valueSyncs={buildMonsterHitPointsFormValueSyncs()}
        onSubmit={vi.fn()}
      />,
    )

    const mediumChip = screen.getByRole('checkbox', { name: 'Medium' })
    expect(mediumChip).toHaveAttribute('aria-checked', 'true')

    await user.click(mediumChip)

    await waitFor(() => {
      expect(mediumChip).toHaveAttribute('aria-checked', 'false')
    })

    const depthErrors = consoleError.mock.calls.filter((call) =>
      String(call[0]).includes('Maximum update depth'),
    )
    expect(depthErrors).toHaveLength(0)

    consoleError.mockRestore()
  })
})
