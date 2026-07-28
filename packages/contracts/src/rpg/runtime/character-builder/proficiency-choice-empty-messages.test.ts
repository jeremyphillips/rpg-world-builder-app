import { describe, expect, it } from 'vitest'

import { formatProficiencyChoiceEmptyMessage } from './readiness/step-readiness-helpers'

describe('formatProficiencyChoiceEmptyMessage', () => {
  it('returns section-specific empty copy by choice type', () => {
    expect(formatProficiencyChoiceEmptyMessage('language')).toBe('No languages chosen yet.')
    expect(formatProficiencyChoiceEmptyMessage('skillProficiency')).toBe('No skills chosen yet.')
    expect(formatProficiencyChoiceEmptyMessage('toolProficiency')).toBe('No tools chosen yet.')
    expect(formatProficiencyChoiceEmptyMessage('weaponProficiency')).toBe('No weapons chosen yet.')
    expect(formatProficiencyChoiceEmptyMessage('armorTraining')).toBe('No armor chosen yet.')
  })

  it('falls back for unknown choice types', () => {
    expect(formatProficiencyChoiceEmptyMessage('equipment')).toBe('No choices chosen yet.')
  })
})
