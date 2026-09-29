import { z } from 'zod'
import { describe, it } from 'vitest'
import type { FormItem } from '@rpg/ui/form'

import { formSelectNumberSchema } from './draft-form-schema-helpers'
import { assertNumericSelectStringValuesParse } from './numeric-select-form-schema.lib'

const rankSchema = z.union([z.literal(10), z.literal(20), z.literal(40)])

describe('assertNumericSelectStringValuesParse', () => {
  const schema = z.object({
    name: z.string().min(1),
    rank: formSelectNumberSchema(rankSchema),
  })

  const fields: FormItem[] = [
    { type: 'text', name: 'name', label: 'Name', required: true },
    {
      type: 'select',
      name: 'rank',
      label: 'Rank',
      required: true,
      options: [
        { value: '40', label: 'High' },
        { value: '10', label: 'Low' },
      ],
    },
  ]

  it('does not introduce a new issue at the numeric select path when baseline fails elsewhere', () => {
    assertNumericSelectStringValuesParse(schema, fields)
  })

  it('accepts a known-valid baseline when defaults are incomplete', () => {
    assertNumericSelectStringValuesParse(schema, fields, {
      knownValidValues: { name: 'Test org', rank: 10 },
    })
  })
})
