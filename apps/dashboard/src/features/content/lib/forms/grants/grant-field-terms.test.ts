import { formatFieldMessage } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  grantFieldLabel,
  grantFieldMinSelectionsMessage,
  grantFieldRequiredSelectMessage,
} from './grant-field-terms'

describe('grant field terms', () => {
  it('builds field labels from vocab sentence forms', () => {
    expect(grantFieldLabel('senseType')).toBe('Sense')
    expect(grantFieldLabel('damageType', { plural: true })).toBe('Damage types')
    expect(grantFieldLabel('armorTrainingSlugs')).toBe('Armor')
  })

  it('builds tier-1 validation messages from vocab nouns', () => {
    expect(formatFieldMessage(grantFieldRequiredSelectMessage('senseType'))).toBe('Select a sense.')
    expect(formatFieldMessage(grantFieldMinSelectionsMessage('toolProficiencySlugs'))).toBe(
      'Select at least one tool.',
    )
    expect(formatFieldMessage(grantFieldMinSelectionsMessage('armorTrainingSlugs'))).toBe(
      'Select at least one piece of armor.',
    )
  })
})
