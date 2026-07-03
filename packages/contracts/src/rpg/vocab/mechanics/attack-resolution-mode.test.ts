import { describe, expect, it } from 'vitest'

import {
  ATTACK_RESOLUTION_MODE_ENTRIES,
  ATTACK_RESOLUTION_MODE_IDS,
  getAttackResolutionModeLabel,
  getAttackResolutionModeSentenceForm,
} from './attack-resolution-mode'

describe('attack resolution mode vocabulary', () => {
  it('has a label and description for every mode', () => {
    for (const id of ATTACK_RESOLUTION_MODE_IDS) {
      const entry = ATTACK_RESOLUTION_MODE_ENTRIES[id]
      expect(entry.label).toBeTruthy()
      expect(entry.description).toBeTruthy()
    }
  })

  it('derives labels from entries', () => {
    expect(getAttackResolutionModeLabel('thac0')).toBe('THAC0')
    expect(getAttackResolutionModeLabel('custom')).toBe('custom')
  })

  it('returns attack resolution sentence forms', () => {
    expect(getAttackResolutionModeSentenceForm('thac0')).toBe('THAC0')
    expect(getAttackResolutionModeSentenceForm('attack_matrix', 2)).toBe('attack matrices')
    expect(getAttackResolutionModeSentenceForm('combat_tables', 2)).toBe('combat tables')
  })
})
