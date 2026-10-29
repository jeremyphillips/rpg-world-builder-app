import { describe, expect, it } from 'vitest'
import { defaultCampaignMechanicsPatch } from '@rpg/contracts'

import {
  buildMechanicsPatchInput,
  defaultMechanicsValues,
  mapRulesetPatchToMechanicsValues,
} from './mechanics-form-values'

describe('mapRulesetPatchToMechanicsValues', () => {
  it('maps resolved mechanics to flat form values', () => {
    const resolved = defaultCampaignMechanicsPatch()

    expect(mapRulesetPatchToMechanicsValues(resolved)).toEqual({
      editionPresetId: '5e',
      armorClassMode: 'ascending',
      armorClassBase: '10',
      attackResolutionMode: 'proficiency_attack_vs_ac',
    })
  })

  it('round-trips through buildMechanicsPatchInput', () => {
    const resolved = defaultCampaignMechanicsPatch()
    const values = mapRulesetPatchToMechanicsValues(resolved)

    expect(buildMechanicsPatchInput(values)).toEqual({
      editionPreset: { id: '5e' },
      armorClass: { mode: 'ascending', base: 10 },
      attackResolution: { mode: 'proficiency_attack_vs_ac' },
    })
  })
})

describe('defaultMechanicsValues', () => {
  it('matches the default 5e preset bundle', () => {
    expect(defaultMechanicsValues()).toEqual(
      mapRulesetPatchToMechanicsValues(defaultCampaignMechanicsPatch()),
    )
  })
})

describe('buildMechanicsPatchInput', () => {
  it('sends mode and base together for a base 9 ascending campaign', () => {
    expect(
      buildMechanicsPatchInput({
        editionPresetId: '5e',
        armorClassMode: 'ascending',
        armorClassBase: '9',
        attackResolutionMode: 'proficiency_attack_vs_ac',
      }),
    ).toEqual({
      editionPreset: { id: '5e' },
      armorClass: { mode: 'ascending', base: 9 },
      attackResolution: { mode: 'proficiency_attack_vs_ac' },
    })
  })
})
