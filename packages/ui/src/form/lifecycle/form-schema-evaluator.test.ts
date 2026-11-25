import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import type { FormItem } from '../field-config'
import { evaluateFormSchema } from './form-schema-evaluator'

const fields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Name', required: true },
  { type: 'number', name: 'level', label: 'Level', required: true },
]

describe('evaluateFormSchema', () => {
  it('returns parsed output for valid input', () => {
    const schema = z.object({
      name: z.string().min(1),
      level: z.coerce.number().int().min(1),
    })

    const result = evaluateFormSchema(schema, { name: 'A', level: '2' }, { items: fields })
    expect(result.kind).toBe('parsed')
    if (result.kind === 'parsed') {
      expect(result.data).toEqual({ name: 'A', level: 2 })
    }
  })

  it('returns label-aware issues without Zod defaults on invalid input', () => {
    const schema = z.object({
      name: z.string().min(1),
      level: z.coerce.number().int().min(1),
    })

    const result = evaluateFormSchema(schema, { name: '', level: 0 }, { items: fields })
    expect(result.kind).toBe('invalid')
    if (result.kind === 'invalid') {
      expect(result.issues.some((issue) => issue.path === 'name')).toBe(true)
      expect(result.issues.find((issue) => issue.path === 'name')?.message).toMatch(/Name/i)
      expect(result.issues.map((i) => i.message).join(' ')).not.toMatch(/Required$/i)
    }
  })

  it('preserves both root and leaf issues in the canonical list', () => {
    const schema = z
      .object({
        modes: z.array(z.string()),
      })
      .superRefine((value, ctx) => {
        ctx.addIssue({ code: 'custom', message: 'Choose movement modes.', path: [] })
        if (value.modes.length < 2) {
          ctx.addIssue({
            code: 'custom',
            message: 'Choose at least 2 available modes.',
            path: ['modes'],
          })
        }
      })

    const modeFields: FormItem[] = [
      { type: 'chips', name: 'modes', label: 'Available modes', required: true },
    ]

    const result = evaluateFormSchema(schema, { modes: [] }, { items: modeFields })
    expect(result.kind).toBe('invalid')
    if (result.kind === 'invalid') {
      expect(result.issues).toHaveLength(2)
      expect(result.rootIssues).toHaveLength(1)
    }
  })
})
