import { describe, expect, it } from 'vitest'
import type { z } from 'zod'

import { formatFieldMessage } from '@rpg/contracts'

import { makeFieldErrorMap } from './field-error-map'
import type { FormItem } from '../field-config'
import {
  GOLDEN_PATH_FIELDS,
  goldenPathSchema,
  type GoldenPathValues,
} from './field-error-map-fixture.lib'

function messageFor(
  schema: z.ZodType,
  value: unknown,
  options?: { path?: (string | number)[]; fields?: FormItem[] },
): string {
  const fields = options?.fields ?? GOLDEN_PATH_FIELDS
  const path = options?.path
  const result = schema.safeParse(value, { error: makeFieldErrorMap(fields) })
  if (result.success) throw new Error('expected parse failure')
  const issue = path
    ? result.error.issues.find((candidate) => candidate.path.join('.') === path.join('.'))
    : result.error.issues[0]
  if (!issue) throw new Error(`no issue at path ${path?.join('.')}`)
  return formatFieldMessage(issue.message)
}

describe('field-error-map golden path fixture', () => {
  it('formats email invalid_format', () => {
    expect(messageFor(goldenPathSchema, { email: 'not-an-email' }, { path: ['email'] })).toBe(
      'Enter a valid email address.',
    )
  })

  it('formats slug regex invalid_format', () => {
    expect(messageFor(goldenPathSchema, { slug: 'Bad Slug' }, { path: ['slug'] })).toBe(
      'Use lowercase letters, numbers, and hyphens only.',
    )
  })

  it('formats discriminated union rows with incompleteUnionOption', () => {
    expect(messageFor(goldenPathSchema, { grant: {} }, { path: ['grant', 'kind'] })).toBe(
      'Complete the required fields for this option.',
    )
  })

  it('formats slot field required text', () => {
    expect(messageFor(goldenPathSchema, { notes: '' }, { path: ['notes'] })).toBe(
      'Notes is required.',
    )
  })

  it('formats editableGrid column labels', () => {
    expect(
      messageFor(
        goldenPathSchema,
        { grid: { cantrips: [0, 1] } },
        { path: ['grid', 'cantrips', 0] },
      ),
    ).toBe('Cantrips must be at least 1.')
  })

  it('formats diceFormula subpaths with the field label', () => {
    expect(
      messageFor(goldenPathSchema, { roll: { count: 0, faces: 6 } }, { path: ['roll', 'count'] }),
    ).toBe('Roll must be at least 1.')
  })

  it('formats array minItems from itemHeader fallback', () => {
    expect(messageFor(goldenPathSchema, { grants: [] }, { path: ['grants'] })).toBe(
      'Add at least one grant.',
    )
  })

  it('formats exact-length arrays', () => {
    expect(messageFor(goldenPathSchema, { tiers: [] }, { path: ['tiers'] })).toBe(
      'Add exactly 2 wealth tiers.',
    )
  })

  it('uses catch-all for registered paths with unknown issue codes', () => {
    const fields: FormItem[] = [{ type: 'text', name: 'name', label: 'Name' }]
    const map = makeFieldErrorMap(fields)
    expect(formatFieldMessage(map({ code: 'unmapped_code', path: ['name'] })!)).toBe(
      'Name is invalid.',
    )
  })
})

describe('field-error-map golden path Form integration', () => {
  it('exports a schema and fields covering each hard case', () => {
    const values: GoldenPathValues = {
      email: 'user@example.com',
      slug: 'my-spell',
      mode: 'a',
      grant: { kind: 'skill', skillId: 'athletics' },
      notes: 'hello',
      grid: { cantrips: [1, 2] },
      roll: { count: 1, faces: 6 },
      grants: [{ label: 'One' }],
      tiers: [{ label: 'Low' }, { label: 'High' }],
    }
    expect(
      goldenPathSchema.safeParse(values, { error: makeFieldErrorMap(GOLDEN_PATH_FIELDS) }).success,
    ).toBe(true)
  })
})
