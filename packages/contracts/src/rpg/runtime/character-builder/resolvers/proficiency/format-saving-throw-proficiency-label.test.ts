import { describe, expect, it } from 'vitest'

import { formatSavingThrowProficiencyLabel } from './format-saving-throw-proficiency-label'

describe('formatSavingThrowProficiencyLabel', () => {
  it('formats ability shorthand and full name', () => {
    expect(formatSavingThrowProficiencyLabel('dex')).toBe('DEX · Dexterity')
    expect(formatSavingThrowProficiencyLabel('int')).toBe('INT · Intelligence')
  })
})
