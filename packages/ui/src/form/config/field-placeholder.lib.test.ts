import { describe, expect, it } from 'vitest'

import { resolveSelectPlaceholder } from './field-placeholder.lib'

describe('resolveSelectPlaceholder', () => {
  it('returns Select {label}… when placeholder is omitted', () => {
    expect(resolveSelectPlaceholder('Spellcasting ability')).toBe('Select Spellcasting ability…')
  })

  it('preserves an explicit placeholder', () => {
    expect(resolveSelectPlaceholder('Spells', 'Choose spells…')).toBe('Choose spells…')
  })
})
