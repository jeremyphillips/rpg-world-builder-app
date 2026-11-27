import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import type { FormItem } from '../field-config'
import { evaluateRoutedFormSchema } from './evaluate-routed-form-schema.lib'

const fields: FormItem[] = [{ name: 'name', label: 'Name', type: 'text' }]

describe('evaluateRoutedFormSchema', () => {
  it('returns valid when the schema accepts input', () => {
    const schema = z.object({ name: z.string().min(1) })
    expect(evaluateRoutedFormSchema(schema, { name: 'Dragon' }, { items: fields })).toEqual({
      kind: 'valid',
      data: { name: 'Dragon' },
    })
  })

  it('returns routed invalid issues with field ownership', () => {
    const schema = z.object({ name: z.string().min(1, 'Name is required.') })
    const result = evaluateRoutedFormSchema(schema, { name: '' }, { items: fields })
    expect(result.kind).toBe('invalid')
    if (result.kind !== 'invalid') return
    expect(result.issues[0]?.path).toBe('name')
  })

  it('returns operation-failure for bounded evaluator errors', () => {
    const schema = z.object({
      name: z.string().superRefine(() => {
        throw new Error('internal')
      }),
    })
    const result = evaluateRoutedFormSchema(schema, { name: 'x' }, { items: fields })
    expect(result.kind).toBe('operation-failure')
    if (result.kind !== 'operation-failure') return
    expect(result.message).not.toContain('internal')
  })
})
