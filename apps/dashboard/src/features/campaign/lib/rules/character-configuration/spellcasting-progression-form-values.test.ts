import { describe, expect, it } from 'vitest'
import { EMPTY_SPELLCASTING_PROGRESSION_PATCH } from '@rpg/contracts'
import { loadSpellcastingProgressionSeed } from '@rpg/catalog/spellcasting-progressions'

import {
  buildSpellcastingProgressionPatchInput,
  resolveSpellcastingProgressionFormState,
} from './spellcasting-progression-form-values'

describe('resolveSpellcastingProgressionFormState', () => {
  it('returns catalog seed when patch is undefined', () => {
    const seed = loadSpellcastingProgressionSeed('srd-cc-5.2.1')
    const state = resolveSpellcastingProgressionFormState(undefined)

    expect(state.slotProgressions.map((entry) => entry.id)).toEqual(
      seed.slotProgressions.map((entry) => entry.id),
    )
    expect(state.profiles.map((entry) => entry.id)).toEqual(seed.profiles.map((entry) => entry.id))
  })
})

describe('buildSpellcastingProgressionPatchInput', () => {
  it('returns empty patch when form state matches seed', () => {
    const state = resolveSpellcastingProgressionFormState(undefined)

    expect(buildSpellcastingProgressionPatchInput(state)).toEqual(
      EMPTY_SPELLCASTING_PROGRESSION_PATCH,
    )
  })

  it('includes profile overrides that differ from seed', () => {
    const state = resolveSpellcastingProgressionFormState(undefined)
    const [firstProfile, ...restProfiles] = state.profiles
    const patch = buildSpellcastingProgressionPatchInput({
      slotProgressions: state.slotProgressions,
      profiles: [{ ...firstProfile!, label: 'Custom bard label' }, ...restProfiles],
    })

    expect(patch?.profiles).toHaveLength(1)
    expect(patch?.profiles?.[0]?.label).toBe('Custom bard label')
    expect(patch?.slotProgressions).toBeUndefined()
  })
})
