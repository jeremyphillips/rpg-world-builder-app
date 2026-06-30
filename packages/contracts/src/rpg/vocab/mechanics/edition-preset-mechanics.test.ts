import { describe, expect, it } from 'vitest'

import { ATTACK_RESOLUTION_MODE_IDS } from './attack-resolution-mode'
import { EDITION_PRESET_IDS } from './edition-preset'
import { EDITION_PRESET_MECHANICS, getEditionPresetMechanics } from './edition-preset-mechanics'

describe('EDITION_PRESET_MECHANICS', () => {
  it('defines a bundle for every edition preset id', () => {
    for (const id of EDITION_PRESET_IDS) {
      expect(EDITION_PRESET_MECHANICS[id]).toEqual(getEditionPresetMechanics(id))
    }
  })

  it('uses proficiency_attack_vs_ac for the 5e preset', () => {
    expect(getEditionPresetMechanics('5e').attackResolution.mode).toBe('proficiency_attack_vs_ac')
  })
})

describe('ATTACK_RESOLUTION_MODE_IDS', () => {
  it('includes every mode referenced by edition preset bundles', () => {
    const referencedModes = new Set(
      EDITION_PRESET_IDS.map((id) => getEditionPresetMechanics(id).attackResolution.mode),
    )

    for (const mode of referencedModes) {
      expect(ATTACK_RESOLUTION_MODE_IDS).toContain(mode)
    }
  })
})
