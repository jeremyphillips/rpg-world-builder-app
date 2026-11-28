import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import type { FormItem } from '../field-config'
import { createValidateSilently, makeResolver } from './form-resolver'

const schema = z.object({
  level: z.coerce.number().int().min(1),
})

type Values = z.infer<typeof schema>

const fields: FormItem[] = [
  { type: 'number', name: 'level', label: 'Level', required: true, defaultValue: 1 },
]

describe('makeResolver — evaluator bridge', () => {
  it('delivers coerced parsed values to submit', async () => {
    const resolver = makeResolver<Values>(schema, fields)
    const values = { level: '2' as unknown as number }

    const result = await resolver(values, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(result.errors).toEqual({})
    expect(result.values).toEqual({ level: 2 })
  })

  it('keeps silent checks aligned with submit without populating errors via resolver path', async () => {
    const validateSilently = createValidateSilently(schema, fields)
    const resolver = makeResolver<Values>(schema, fields)
    const values = { level: '2' as unknown as number }

    const silent = await validateSilently(values)
    const submit = await resolver(values, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(silent.valid).toBe(true)
    expect(submit.errors).toEqual({})
    expect(submit.values).toEqual({ level: 2 })
  })
})
