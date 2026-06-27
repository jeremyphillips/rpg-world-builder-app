import { describe, expect, it } from 'vitest'

import {
  ENABLED_HOMEBREW_RULES_CONFIGS,
  findRulesConfigEntry,
  HOMEBREW_RULES_CONFIGS,
} from './rules-config-registry'

describe('rules-config-registry', () => {
  it('includes character configuration as an enabled entry', () => {
    expect(ENABLED_HOMEBREW_RULES_CONFIGS).toEqual([
      { id: 'character-configuration', label: 'Character Configuration', enabled: true },
    ])
  })

  it('finds registry entries by id', () => {
    expect(findRulesConfigEntry('character-configuration')).toEqual(HOMEBREW_RULES_CONFIGS[0])
    expect(findRulesConfigEntry('missing')).toBeUndefined()
  })
})
