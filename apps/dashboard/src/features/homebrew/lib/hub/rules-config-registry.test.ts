import { describe, expect, it } from 'vitest'

import {
  ENABLED_HOMEBREW_RULES_CONFIGS,
  findRulesConfigEntry,
  HOMEBREW_RULES_CONFIGS,
} from './rules-config-registry'

describe('rules-config-registry', () => {
  it('includes enabled character configuration and mechanics entries', () => {
    expect(ENABLED_HOMEBREW_RULES_CONFIGS).toEqual([
      {
        id: 'character-configuration',
        label: 'Character Configuration',
        description: 'Configure character creation rules',
        enabled: true,
      },
      {
        id: 'mechanics',
        label: 'Mechanics',
        description: 'Configure edition presets, armor class, and attack resolution',
        enabled: true,
      },
    ])
  })

  it('finds registry entries by id', () => {
    expect(findRulesConfigEntry('character-configuration')).toEqual(HOMEBREW_RULES_CONFIGS[0])
    expect(findRulesConfigEntry('mechanics')).toEqual(HOMEBREW_RULES_CONFIGS[1])
    expect(findRulesConfigEntry('missing')).toBeUndefined()
  })
})
