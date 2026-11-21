import { describe, expect, it } from 'vitest'

import {
  multiattackUseStepRepetitionAddVisible,
  multiattackUseStepRepetitionSlotVisible,
} from './monster-multiattack-use-repetition.lib'

describe('multiattackUseStepRepetitionSlotVisible', () => {
  it('hides repetition for spellcasting until repair is required', () => {
    expect(multiattackUseStepRepetitionSlotVisible({ actionKind: 'spell', count: undefined })).toBe(
      false,
    )
    expect(multiattackUseStepRepetitionSlotVisible({ actionKind: 'spell', count: 2 })).toBe(true)
  })

  it('keeps repetition for non-spell actions', () => {
    expect(multiattackUseStepRepetitionSlotVisible({ actionKind: 'save', count: undefined })).toBe(
      true,
    )
  })
})

describe('multiattackUseStepRepetitionAddVisible', () => {
  it('hides Add repetition for spellcasting', () => {
    expect(multiattackUseStepRepetitionAddVisible('spell')).toBe(false)
    expect(multiattackUseStepRepetitionAddVisible('save')).toBe(true)
  })
})
