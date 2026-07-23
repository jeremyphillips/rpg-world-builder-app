import { describe, expect, it } from 'vitest'

import {
  DEFAULT_FIELD_BORDER_LADDER_TONE,
  FIELD_BORDER_LADDER_TONES,
  fieldBorderLadderToneClasses,
  isFieldBorderLadderTone,
  resolveFieldBorderLadderToneClasses,
} from './field-border-ladder.variants'

describe('fieldBorderLadderToneClasses', () => {
  it.each(FIELD_BORDER_LADDER_TONES)('maps %s to a border utility', (tone) => {
    expect(resolveFieldBorderLadderToneClasses(tone)).toBe(fieldBorderLadderToneClasses[tone])
  })

  it('defaults to subtle', () => {
    expect(DEFAULT_FIELD_BORDER_LADDER_TONE).toBe('subtle')
    expect(resolveFieldBorderLadderToneClasses()).toBe('border-border-subtle')
  })

  it('narrows ladder tone strings', () => {
    expect(isFieldBorderLadderTone('faint')).toBe(true)
    expect(isFieldBorderLadderTone('primary')).toBe(false)
  })
})
