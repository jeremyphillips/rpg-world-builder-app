import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { makeFieldErrorMap } from './field-error-map'
import type { FormItem } from '../field-config'

const fields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Name', required: true },
  { type: 'number', name: 'quantity', label: 'Quantity', min: 1 },
  { type: 'select', name: 'rarity', label: 'Rarity', options: [], required: true },
  { type: 'chips', name: 'damageTypes', label: 'Damage types', options: [] },
  { type: 'chips', name: 'category', label: 'Category', options: [], multiple: false },
  {
    kind: 'group',
    legend: 'Details',
    fields: [{ type: 'textarea', name: 'description', label: 'Description' }],
  },
  {
    kind: 'array',
    name: 'tiers',
    legend: 'Wealth tiers',
    fields: [
      { type: 'text', name: 'label', label: 'Tier label', required: true },
      { type: 'levelRange', name: 'minLevel', label: 'Level range', options: [] },
      {
        type: 'inputSelect',
        name: 'bonusGold',
        label: 'Base',
        inputType: 'number',
        valueKey: 'baseGp',
        unitKey: 'baseCurrency',
      },
    ],
  },
]

function messageFor(schema: z.ZodType, value: unknown, path?: (string | number)[]): string {
  const result = schema.safeParse(value, { error: makeFieldErrorMap(fields) })
  if (result.success) throw new Error('expected parse failure')
  const issue = path
    ? result.error.issues.find((candidate) => candidate.path.join('.') === path.join('.'))
    : result.error.issues[0]
  if (!issue) throw new Error(`no issue at path ${path?.join('.')}`)
  return issue.message
}

describe('makeFieldErrorMap', () => {
  it('formats missing required text as "{label} is required."', () => {
    expect(messageFor(z.object({ name: z.string() }), {})).toBe('Name is required.')
  })

  it('formats empty required text (min 1) as "{label} is required."', () => {
    expect(messageFor(z.object({ name: z.string().min(1) }), { name: '' })).toBe(
      'Name is required.',
    )
  })

  it('formats string length bounds with the field label', () => {
    expect(messageFor(z.object({ name: z.string().min(3) }), { name: 'ab' })).toBe(
      'Name must be at least 3 characters.',
    )
    expect(messageFor(z.object({ name: z.string().max(4) }), { name: 'abcde' })).toBe(
      'Name cannot exceed 4 characters.',
    )
  })

  it('formats missing numbers as required and bounds with the label', () => {
    const schema = z.object({ quantity: z.number().int().min(1).max(20) })

    expect(messageFor(schema, {})).toBe('Quantity is required.')
    expect(messageFor(schema, { quantity: 0 })).toBe('Quantity must be at least 1.')
    expect(messageFor(schema, { quantity: 21 })).toBe('Quantity cannot exceed 20.')
    expect(messageFor(schema, { quantity: 1.5 })).toBe('Quantity must be a whole number.')
  })

  it('formats select issues as choose messages', () => {
    const schema = z.object({ rarity: z.enum(['common', 'rare']) })

    expect(messageFor(schema, {})).toBe('Choose a rarity.')
    expect(messageFor(schema, { rarity: '' })).toBe('Choose a rarity.')
    expect(messageFor(schema, { rarity: 'bogus' })).toBe('Choose a valid rarity.')
  })

  it('treats single-select chips as a choice field', () => {
    expect(
      messageFor(z.object({ category: z.enum(['martial', 'simple']) }), { category: 'x' }),
    ).toBe('Choose a valid category.')
  })

  it('formats multi-chips minimums as add-at-least messages', () => {
    const schema = z.object({ damageTypes: z.array(z.string()).min(1) })
    const countSchema = z.object({ damageTypes: z.array(z.string()).min(2) })

    expect(messageFor(schema, { damageTypes: [] })).toBe('Add at least one damage type.')
    expect(messageFor(countSchema, { damageTypes: ['fire'] })).toBe('Add at least 2 damage types.')
  })

  it('formats array container minimums from the legend', () => {
    expect(messageFor(z.object({ tiers: z.array(z.object({})).min(1) }), { tiers: [] })).toBe(
      'Add at least one wealth tier.',
    )
  })

  it('resolves fields nested in array items', () => {
    const schema = z.object({
      tiers: z.array(z.object({ label: z.string().min(1), minLevel: z.number().min(1) })),
    })

    expect(messageFor(schema, { tiers: [{ label: '', minLevel: 1 }] }, ['tiers', 0, 'label'])).toBe(
      'Tier label is required.',
    )
    expect(
      messageFor(schema, { tiers: [{ label: 'A', minLevel: 0 }] }, ['tiers', 0, 'minLevel']),
    ).toBe('Level range must be at least 1.')
  })

  it('resolves composite subpaths to the owning field', () => {
    const schema = z.object({
      tiers: z.array(z.object({ bonusGold: z.object({ baseGp: z.number().min(0) }) })),
    })

    expect(
      messageFor(schema, { tiers: [{ bonusGold: { baseGp: -1 } }] }, [
        'tiers',
        0,
        'bonusGold',
        'baseGp',
      ]),
    ).toBe('Base must be at least 0.')
  })

  it('keeps custom refinement messages untouched', () => {
    const schema = z.object({
      quantity: z.number().refine(() => false, { message: 'Domain rule message' }),
    })

    expect(messageFor(schema, { quantity: 3 })).toBe('Domain rule message')
  })

  it('falls back to the Zod default for unregistered paths', () => {
    const schema = z.object({ unknownField: z.string() })

    expect(messageFor(schema, {})).toBe('Invalid input: expected string, received undefined')
  })
})
