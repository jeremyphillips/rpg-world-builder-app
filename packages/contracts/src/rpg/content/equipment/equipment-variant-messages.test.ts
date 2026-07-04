import { describe, expect, it } from 'vitest'

import { formatFieldMessage } from '../../../validation/define-message'
import { equipmentVariantValidationMessages } from './equipment-variant-messages'

describe('equipmentVariantValidationMessages', () => {
  it.each([
    [
      'damageDamageTypeTogether',
      formatFieldMessage(equipmentVariantValidationMessages.damageDamageTypeTogether()),
      'Damage and damage type must both be set or both be left empty.',
    ],
    [
      'holySymbolUsageRequired',
      formatFieldMessage(equipmentVariantValidationMessages.holySymbolUsageRequired()),
      'Holy symbols need at least one carrying option.',
    ],
  ])('%s formats user-facing copy', (_name, actual, expected) => {
    expect(actual).toBe(expected)
  })
})
