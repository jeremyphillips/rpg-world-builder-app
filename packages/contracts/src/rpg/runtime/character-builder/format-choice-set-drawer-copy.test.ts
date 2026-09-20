import { describe, expect, it } from 'vitest'

import { formatChoiceSetDrawerHeading } from './format-choice-set-drawer-copy'

describe('formatChoiceSetDrawerHeading', () => {
  it('returns stable Choose headings from choice type vocabulary', () => {
    expect(formatChoiceSetDrawerHeading('skillProficiency')).toBe('Choose skill proficiency')
    expect(formatChoiceSetDrawerHeading('toolProficiency')).toBe('Choose tool proficiency')
    expect(formatChoiceSetDrawerHeading('weaponProficiency')).toBe('Choose weapon proficiency')
    expect(formatChoiceSetDrawerHeading('armorTraining')).toBe('Choose armor training')
    expect(formatChoiceSetDrawerHeading('language')).toBe('Choose language')
    expect(formatChoiceSetDrawerHeading('cantrip')).toBe('Choose cantrip')
    expect(formatChoiceSetDrawerHeading('spell')).toBe('Choose spell')
    expect(formatChoiceSetDrawerHeading('equipment')).toBe('Choose equipment')
    expect(formatChoiceSetDrawerHeading('feat')).toBe('Choose feat')
  })
})
