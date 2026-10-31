import { describe, expect, it } from 'vitest'

import { ACTION_VOCABULARY_ENTRIES } from '../../vocab/action/action-vocabulary'
import {
  ACTION_PRESET_ENTRIES,
  getActionPreset,
  listSpecialMenuActionPresetIds,
} from './action-presets'

describe('action presets', () => {
  it('never references a core vocabulary id', () => {
    for (const preset of Object.values(ACTION_PRESET_ENTRIES)) {
      expect(ACTION_VOCABULARY_ENTRIES[preset.vocabularyId].group).not.toBe('core')
    }
  })

  it('gives rend the claw form without a rend anatomy entry', () => {
    const rend = getActionPreset('rend')
    expect(rend?.mechanics).toBe('attack-roll')
    if (rend?.mechanics !== 'attack-roll') return
    expect(rend.defaults.naturalForm).toBe('claw')
    expect(ACTION_VOCABULARY_ENTRIES.rend.naturalForm).toBe('claw')
  })

  it('returns undefined for an unknown preset id', () => {
    expect(getActionPreset('not-a-preset')).toBeUndefined()
  })

  it('stamps saving-throw presets with a default dc source', () => {
    const breath = getActionPreset('breath-weapon')
    expect(breath?.mechanics).toBe('saving-throw')
    if (breath?.mechanics !== 'saving-throw') return
    expect(breath.defaults.dcSource).toEqual({
      kind: 'ability',
      ability: 'con',
      proficient: true,
    })
  })

  it('lists special menu presets from vocabulary group', () => {
    expect(listSpecialMenuActionPresetIds()).toEqual(['breath-weapon', 'constrict', 'multiattack'])
  })
})
