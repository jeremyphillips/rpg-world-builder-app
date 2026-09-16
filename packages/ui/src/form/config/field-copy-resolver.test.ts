import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { fieldValidationMessages, formatFieldMessage } from '@rpg/contracts'

import type { FieldConfig } from '../field-config'
import { resolveFieldCopyContext } from './field-copy-context.lib'
import { resolveFieldInstruction } from './field-instruction.lib'
import { makeFieldErrorMap } from './field-error-map'
import { resolveFieldPlaceholder } from './field-placeholder.lib'

const primaryAbilitiesNoun = {
  singular: 'primary ability',
  plural: 'primary abilities',
} as const

function messageFor(field: FieldConfig, schema: z.ZodType, value: unknown): string {
  const result = schema.safeParse(value, { error: makeFieldErrorMap([field]) })
  if (result.success) throw new Error('expected parse failure')
  return formatFieldMessage(result.error.issues[0]!.message)
}

describe('field copy resolver integration', () => {
  it.each([
    [
      'select required',
      { type: 'select', name: 'rarity', label: 'Rarity', options: [], required: true },
      z.object({ rarity: z.enum(['common']) }),
      {},
      'Choose a rarity.',
    ],
    [
      'combobox required single',
      {
        type: 'combobox',
        name: 'armor',
        label: 'Armor',
        options: [],
        multiple: false,
        required: true,
      },
      z.object({ armor: z.enum(['light', 'heavy']) }),
      {},
      'Choose an armor.',
    ],
    [
      'chips min 1',
      {
        type: 'chips',
        name: 'skills',
        label: 'Skills',
        options: [],
        min: 1,
        noun: { singular: 'skill', plural: 'skills' },
      },
      z.object({ skills: z.array(z.string()).min(1) }),
      { skills: [] },
      'Choose at least one skill.',
    ],
    [
      'chips min 2',
      {
        type: 'chips',
        name: 'skills',
        label: 'Skills',
        options: [],
        min: 2,
        noun: { singular: 'skill', plural: 'skills' },
      },
      z.object({ skills: z.array(z.string()).min(2) }),
      { skills: ['a'] },
      'Choose at least 2 skills.',
    ],
    [
      'text required',
      { type: 'text', name: 'name', label: 'Name', required: true },
      z.object({ name: z.string().min(1) }),
      { name: '' },
      'Name is required.',
    ],
    [
      'number required',
      { type: 'number', name: 'level', label: 'Level', required: true },
      z.object({ level: z.number().int().min(1) }),
      {},
      'Level is required.',
    ],
  ] as const)('validation: %s', (_label, field, schema, value, expected) => {
    expect(messageFor(field as FieldConfig, schema, value)).toBe(expected)
    expect(messageFor(field as FieldConfig, schema, value)).not.toMatch(/^Select /)
  })

  it('derives chips max and exact constraint hints', () => {
    const context = resolveFieldCopyContext({
      type: 'chips',
      name: 'primaryAbilities',
      label: 'Primary abilities',
      options: [],
      min: 1,
      max: 2,
      noun: primaryAbilitiesNoun,
    })

    expect(resolveFieldInstruction(context)).toBe('Choose 1–2 primary abilities.')
  })

  it('uses explicit placeholder and hint overrides', () => {
    const field: FieldConfig = {
      type: 'select',
      name: 'mode',
      label: 'Mode',
      options: [],
      placeholder: 'Custom placeholder…',
      hint: 'Custom hint.',
    }

    expect(
      resolveFieldPlaceholder({ label: field.label, category: 'choice' }, field.placeholder),
    ).toBe('Custom placeholder…')
  })

  it('uses explicit noun metadata for choice validation and placeholders', () => {
    const field: FieldConfig = {
      type: 'select',
      name: 'mode',
      label: 'Mode',
      options: [],
      required: true,
      noun: { singular: 'movement mode' },
    }

    expect(
      resolveFieldPlaceholder({
        label: field.label,
        category: 'choice',
        noun: field.noun,
      }),
    ).toBe('Choose a movement mode…')
    expect(messageFor(field, z.object({ mode: z.enum(['walk']) }), {})).toBe(
      'Choose a movement mode.',
    )
  })

  it('flips placeholder vocabulary when field category changes', () => {
    const label = 'Score'
    expect(resolveFieldPlaceholder({ label, category: 'number' })).toBeUndefined()
    expect(resolveFieldPlaceholder({ label, category: 'choice' })).toBe('Choose a score…')
  })

  it('shares Choose vocabulary between instruction and validation for multi fields', () => {
    const field: FieldConfig = {
      type: 'chips',
      name: 'primaryAbilities',
      label: 'Primary abilities',
      options: [],
      min: 1,
      max: 2,
      noun: primaryAbilitiesNoun,
    }

    expect(resolveFieldInstruction(resolveFieldCopyContext(field))).toBe(
      'Choose 1–2 primary abilities.',
    )
    expect(
      messageFor(field, z.object({ primaryAbilities: z.array(z.string()).min(1) }), {
        primaryAbilities: [],
      }),
    ).toBe(
      formatFieldMessage(fieldValidationMessages.minSelections({ itemLabel: 'primary ability' })),
    )
  })
})
