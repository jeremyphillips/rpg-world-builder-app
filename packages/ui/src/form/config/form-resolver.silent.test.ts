import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { createValidateSilently, makeResolver } from './form-resolver'
import type { FormItem } from '../field-config'

const conditionalSchema = z.object({
  featureEnabled: z.boolean(),
  featureValue: z.number().min(1).optional(),
})

type ConditionalValues = z.infer<typeof conditionalSchema>

const conditionalFields: FormItem[] = [
  {
    kind: 'dependent',
    controller: {
      type: 'switch',
      name: 'featureEnabled',
      label: 'Enable feature',
      defaultValue: false,
    },
    dependents: {
      fields: [
        {
          type: 'number',
          name: 'featureValue',
          label: 'Feature value',
          required: true,
          visibility: {
            dependsOn: ['featureEnabled'],
            visibleWhen: (values) => values.featureEnabled === true,
          },
        },
      ],
    },
  },
]

describe('createValidateSilently', () => {
  it('returns valid when hidden conditional fields are omitted', async () => {
    const resolver = makeResolver<ConditionalValues>(conditionalSchema, conditionalFields)
    const validateSilently = createValidateSilently(resolver)

    const result = await validateSilently({ featureEnabled: false })
    expect(result.valid).toBe(true)
  })

  it('returns invalid when a visible conditional field fails', async () => {
    const resolver = makeResolver<ConditionalValues>(conditionalSchema, conditionalFields)
    const validateSilently = createValidateSilently(resolver)

    const result = await validateSilently({ featureEnabled: true, featureValue: 0 })
    expect(result.valid).toBe(false)
  })

  it('matches the submit resolver pass/fail for the same values', async () => {
    const resolver = makeResolver<ConditionalValues>(conditionalSchema, conditionalFields)
    const validateSilently = createValidateSilently(resolver)
    const values = { featureEnabled: true, featureValue: 3 }

    const silent = await validateSilently(values)
    const submit = await resolver(values, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(silent.valid).toBe(Object.keys(submit.errors).length === 0)
  })
})

describe('createValidateSilently — tabbed resolverFields', () => {
  const embeddedSchema = z.object({
    heritage: z.object({
      name: z.string().min(1, 'Heritage name is required'),
    }),
  })

  type EmbeddedValues = z.infer<typeof embeddedSchema>

  const resolverFields: FormItem[] = [
    { type: 'text', name: 'heritage.name', label: 'Heritage name', required: true },
  ]

  it('validates header-only resolver paths', async () => {
    const resolver = makeResolver<EmbeddedValues>(embeddedSchema, resolverFields)
    const validateSilently = createValidateSilently(resolver)

    expect(await validateSilently({ heritage: { name: '' } })).toEqual({ valid: false })
    expect(await validateSilently({ heritage: { name: 'Moon elf' } })).toEqual({ valid: true })
  })
})

describe('createValidateSilently — coerced values', () => {
  const schema = z.object({
    level: z.coerce.number().int().min(1),
  })

  type Values = z.infer<typeof schema>

  const fields: FormItem[] = [
    { type: 'number', name: 'level', label: 'Level', required: true, defaultValue: 1 },
  ]

  it('matches submit resolver for coerced numeric input', async () => {
    const resolver = makeResolver<Values>(schema, fields)
    const validateSilently = createValidateSilently(resolver)
    const values = { level: '2' as unknown as number }

    const silent = await validateSilently(values)
    const submit = await resolver(values, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })

    expect(silent.valid).toBe(Object.keys(submit.errors).length === 0)
  })
})
