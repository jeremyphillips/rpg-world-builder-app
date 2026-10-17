import { describe, expect, it } from 'vitest'

import {
  buildAbilityPreferenceLabelsByAbility,
  formatAbilityPreferenceIndicatorLabel,
} from './ability-preference-indicator.lib'

describe('formatAbilityPreferenceIndicatorLabel', () => {
  it('joins multiple preference sentences for one ability', () => {
    const label = formatAbilityPreferenceIndicatorLabel([
      { ability: 'str', source: 'class', emphasis: 'primary', className: 'Fighter' },
      { ability: 'str', source: 'class', emphasis: 'secondary', className: 'Champion' },
    ])

    expect(label).toContain('Recommended primary ability for Fighter.')
    expect(label).toContain('Also useful for Champion.')
  })
})

describe('buildAbilityPreferenceLabelsByAbility', () => {
  it('maps preferences onto ability ids', () => {
    const labels = buildAbilityPreferenceLabelsByAbility([
      { ability: 'str', source: 'class', emphasis: 'primary', className: 'Fighter' },
      { ability: 'dex', source: 'class', emphasis: 'secondary', className: 'Fighter' },
    ])

    expect(labels.str).toBe('Recommended primary ability for Fighter.')
    expect(labels.dex).toBe('Also useful for Fighter.')
    expect(labels.con).toBeUndefined()
  })
})
