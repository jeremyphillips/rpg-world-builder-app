import { describe, expect, it } from 'vitest'

import { defineMessage, decodeStructuredMessage } from './define-message'
import {
  fieldValidationMessages,
  midSentenceLabel,
  singularizeLabel,
  withArticle,
} from './messages'

describe('defineMessage', () => {
  it('formats params and exposes a stable id', () => {
    const message = defineMessage<{ min: number }>(
      'validation.test.min',
      ({ min }) => `At least ${min}.`,
    )

    expect(message({ min: 3 })).toBe('At least 3.')
    expect(message.id).toBe('validation.test.min')
  })

  it('supports parameterless messages', () => {
    const message = defineMessage('validation.test.plain', () => 'Plain.')

    expect(message()).toBe('Plain.')
  })

  it('encodes field and summary variants when both are provided', () => {
    const message = defineMessage<{ label: string }>(
      'validation.test.required',
      ({ label }) => `${label} is required.`,
      ({ label }) => `Missing ${label}`,
    )

    expect(decodeStructuredMessage(message({ label: 'Rarity' }))).toEqual({
      field: 'Rarity is required.',
      summary: 'Missing Rarity',
    })
  })
})

describe('label helpers', () => {
  it('lowercases labels mid-sentence but preserves initialisms', () => {
    expect(midSentenceLabel('Damage type')).toBe('damage type')
    expect(midSentenceLabel('XP progression')).toBe('XP progression')
  })

  it('picks the indefinite article by leading vowel', () => {
    expect(withArticle('rarity')).toBe('a rarity')
    expect(withArticle('ability')).toBe('an ability')
  })

  it('singularizes common plural labels', () => {
    expect(singularizeLabel('Wealth tiers')).toBe('Wealth tier')
    expect(singularizeLabel('Abilities')).toBe('Ability')
    expect(singularizeLabel('Class')).toBe('Class')
  })
})

describe('fieldValidationMessages', () => {
  function fieldMessage(message: string): string {
    return decodeStructuredMessage(message)?.field ?? message
  }

  it.each([
    [
      'requiredText',
      fieldMessage(fieldValidationMessages.requiredText({ label: 'Name' })),
      'Name is required.',
    ],
    [
      'requiredSelect',
      fieldMessage(fieldValidationMessages.requiredSelect({ label: 'Rarity' })),
      'Choose a rarity.',
    ],
    [
      'invalidSelect',
      fieldMessage(fieldValidationMessages.invalidSelect({ label: 'Rarity' })),
      'Choose a valid rarity.',
    ],
    ['invalidNumber', fieldValidationMessages.invalidNumber(), 'Enter a valid number.'],
    [
      'minNumber',
      fieldValidationMessages.minNumber({ label: 'Level', min: 1 }),
      'Level must be at least 1.',
    ],
    [
      'maxNumber',
      fieldValidationMessages.maxNumber({ label: 'Level', max: 20 }),
      'Level cannot exceed 20.',
    ],
    [
      'integer',
      fieldValidationMessages.integer({ label: 'Level' }),
      'Level must be a whole number.',
    ],
    [
      'minLength',
      fieldValidationMessages.minLength({ label: 'Slug', min: 3 }),
      'Slug must be at least 3 characters.',
    ],
    [
      'maxLength',
      fieldValidationMessages.maxLength({ label: 'Slug', max: 64 }),
      'Slug cannot exceed 64 characters.',
    ],
    [
      'minItems',
      fieldValidationMessages.minItems({ itemLabel: 'wealth tier' }),
      'Add at least one wealth tier.',
    ],
    [
      'minItemsCount',
      fieldValidationMessages.minItemsCount({ itemsLabel: 'skills', min: 2 }),
      'Add at least 2 skills.',
    ],
    [
      'duplicateItem',
      fieldValidationMessages.duplicateItem({ itemLabel: 'class' }),
      'This class is already used.',
    ],
  ])('%s formats the boilerplate copy', (_name, actual, expected) => {
    expect(actual).toBe(expected)
  })

  it('uses validation.field.* ids', () => {
    for (const message of Object.values(fieldValidationMessages)) {
      expect(message.id).toMatch(/^validation\.field\.[a-zA-Z]+$/)
    }
  })

  it('encodes summary variants for field and choice messages', () => {
    expect(
      decodeStructuredMessage(fieldValidationMessages.requiredText({ label: 'Quantity' })),
    ).toEqual({
      field: 'Quantity is required.',
      summary: 'Missing Quantity',
    })
    expect(
      decodeStructuredMessage(fieldValidationMessages.requiredSelect({ label: 'Rarity' })),
    ).toEqual({
      field: 'Choose a rarity.',
      summary: 'Missing Rarity',
    })
    expect(
      decodeStructuredMessage(fieldValidationMessages.invalidSelect({ label: 'Rarity' })),
    ).toEqual({
      field: 'Choose a valid rarity.',
      summary: 'Invalid Rarity',
    })
    expect(decodeStructuredMessage(fieldValidationMessages.invalidNumber())).toBeNull()
  })
})
