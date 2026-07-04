import { describe, expect, it } from 'vitest'

import {
  defineMessage,
  decodeStructuredMessage,
  formatFieldMessage,
  encodeStructuredMessage,
} from './define-message'
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

    expect(formatFieldMessage(message({ min: 3 }))).toBe('At least 3.')
    expect(message.id).toBe('validation.test.min')
    expect(decodeStructuredMessage(message({ min: 3 }))).toMatchObject({
      field: 'At least 3.',
      messageId: 'validation.test.min',
      params: { min: 3 },
    })
  })

  it('supports parameterless messages', () => {
    const message = defineMessage('validation.test.plain', () => 'Plain.')

    expect(formatFieldMessage(message())).toBe('Plain.')
    expect(decodeStructuredMessage(message())).toMatchObject({
      field: 'Plain.',
      messageId: 'validation.test.plain',
    })
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
      messageId: 'validation.test.required',
      params: { label: 'Rarity' },
    })
  })

  it('round-trips messageId and params through encodeStructuredMessage', () => {
    const encoded = encodeStructuredMessage(
      'Choose a rarity.',
      'Missing Rarity',
      'validation.field.requiredSelect',
      { label: 'Rarity' },
    )

    expect(decodeStructuredMessage(encoded)).toEqual({
      field: 'Choose a rarity.',
      summary: 'Missing Rarity',
      messageId: 'validation.field.requiredSelect',
      params: { label: 'Rarity' },
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
  it.each([
    [
      'requiredText',
      formatFieldMessage(fieldValidationMessages.requiredText({ label: 'Name' })),
      'Name is required.',
    ],
    [
      'requiredSelect',
      formatFieldMessage(fieldValidationMessages.requiredSelect({ label: 'Rarity' })),
      'Choose a rarity.',
    ],
    [
      'invalidSelect',
      formatFieldMessage(fieldValidationMessages.invalidSelect({ label: 'Rarity' })),
      'Choose a valid rarity.',
    ],
    [
      'invalidNumber',
      formatFieldMessage(fieldValidationMessages.invalidNumber()),
      'Enter a valid number.',
    ],
    [
      'minNumber',
      formatFieldMessage(fieldValidationMessages.minNumber({ label: 'Level', min: 1 })),
      'Level must be at least 1.',
    ],
    [
      'maxNumber',
      formatFieldMessage(fieldValidationMessages.maxNumber({ label: 'Level', max: 20 })),
      'Level cannot exceed 20.',
    ],
    [
      'integer',
      formatFieldMessage(fieldValidationMessages.integer({ label: 'Level' })),
      'Level must be a whole number.',
    ],
    [
      'minLength',
      formatFieldMessage(fieldValidationMessages.minLength({ label: 'Slug', min: 3 })),
      'Slug must be at least 3 characters.',
    ],
    [
      'maxLength',
      formatFieldMessage(fieldValidationMessages.maxLength({ label: 'Slug', max: 64 })),
      'Slug cannot exceed 64 characters.',
    ],
    [
      'minItems',
      formatFieldMessage(fieldValidationMessages.minItems({ itemLabel: 'wealth tier' })),
      'Add at least one wealth tier.',
    ],
    [
      'minItemsCount',
      formatFieldMessage(fieldValidationMessages.minItemsCount({ itemsLabel: 'skills', min: 2 })),
      'Add at least 2 skills.',
    ],
    [
      'duplicateItem',
      formatFieldMessage(fieldValidationMessages.duplicateItem({ itemLabel: 'class' })),
      'This class is already used.',
    ],
    [
      'invalidEmail',
      formatFieldMessage(fieldValidationMessages.invalidEmail()),
      'Enter a valid email address.',
    ],
    ['invalidUrl', formatFieldMessage(fieldValidationMessages.invalidUrl()), 'Enter a valid URL.'],
    [
      'invalidFormat',
      formatFieldMessage(fieldValidationMessages.invalidFormat({ label: 'Slug' })),
      'Slug has an invalid format.',
    ],
    [
      'invalidSlug',
      formatFieldMessage(fieldValidationMessages.invalidSlug()),
      'Use lowercase letters, numbers, and hyphens only.',
    ],
    [
      'invalidValue',
      formatFieldMessage(fieldValidationMessages.invalidValue({ label: 'Mode' })),
      'Mode has an invalid value.',
    ],
    [
      'incompleteUnionOption',
      formatFieldMessage(fieldValidationMessages.incompleteUnionOption()),
      'Complete the required fields for this option.',
    ],
    [
      'exactItemsCount',
      formatFieldMessage(
        fieldValidationMessages.exactItemsCount({ itemsLabel: 'wealth tiers', count: 3 }),
      ),
      'Add exactly 3 wealth tiers.',
    ],
    [
      'tooSmallGeneric',
      formatFieldMessage(fieldValidationMessages.tooSmallGeneric({ label: 'Date' })),
      'Date is too small.',
    ],
    [
      'tooBigGeneric',
      formatFieldMessage(fieldValidationMessages.tooBigGeneric({ label: 'Date' })),
      'Date is too large.',
    ],
    [
      'invalidField',
      formatFieldMessage(fieldValidationMessages.invalidField({ label: 'Notes' })),
      'Notes is invalid.',
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
      messageId: 'validation.field.requiredText',
      params: { label: 'Quantity' },
    })
    expect(
      decodeStructuredMessage(fieldValidationMessages.requiredSelect({ label: 'Rarity' })),
    ).toEqual({
      field: 'Choose a rarity.',
      summary: 'Missing Rarity',
      messageId: 'validation.field.requiredSelect',
      params: { label: 'Rarity' },
    })
    expect(
      decodeStructuredMessage(fieldValidationMessages.invalidSelect({ label: 'Rarity' })),
    ).toEqual({
      field: 'Choose a valid rarity.',
      summary: 'Invalid Rarity',
      messageId: 'validation.field.invalidSelect',
      params: { label: 'Rarity' },
    })
    expect(decodeStructuredMessage(fieldValidationMessages.invalidNumber())).toMatchObject({
      field: 'Enter a valid number.',
      messageId: 'validation.field.invalidNumber',
    })
  })
})
