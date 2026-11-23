import { describe, expect, it } from 'vitest'

import { spellcastingProgressionTestSeed } from '../../../campaign/rules/spellcasting-progression/fixtures'
import { getSlotProgressionKindLabel } from '../../../vocab/spell/slot-progression-kind'
import { CLASS_FEATURE_KIND_ENTRIES } from '../class'

import {
  PACT_MAGIC_SLOT_PROGRESSION_ID,
  spellcastingGrantingFeatureDefaultName,
  spellcastingGrantingFeatureDisplayName,
  spellcastingGrantingFeatureId,
  usesPactMagicSlotProgression,
} from './spellcasting-granting-feature'

describe('spellcastingGrantingFeature', () => {
  it('detects pact magic from slot progression kind or id', () => {
    expect(usesPactMagicSlotProgression({ slotProgression: { kind: 'pact' } })).toBe(true)
    expect(
      usesPactMagicSlotProgression({ slotProgressionId: PACT_MAGIC_SLOT_PROGRESSION_ID }),
    ).toBe(true)
    expect(usesPactMagicSlotProgression({ slotProgressionId: 'full-caster' })).toBe(false)
  })

  it('derives granting feature id from progression ref', () => {
    expect(spellcastingGrantingFeatureId({ slotProgressionId: 'full-caster' })).toBe('spellcasting')
    expect(
      spellcastingGrantingFeatureId({ slotProgressionId: PACT_MAGIC_SLOT_PROGRESSION_ID }),
    ).toBe(PACT_MAGIC_SLOT_PROGRESSION_ID)
  })

  it('defaults names from vocab and class feature kind labels', () => {
    expect(
      spellcastingGrantingFeatureDefaultName({ slotProgressionId: PACT_MAGIC_SLOT_PROGRESSION_ID }),
    ).toBe(getSlotProgressionKindLabel(PACT_MAGIC_SLOT_PROGRESSION_ID))
    expect(spellcastingGrantingFeatureDefaultName({})).toBe(
      CLASS_FEATURE_KIND_ENTRIES.spellcasting.label,
    )
    const fullCaster = spellcastingProgressionTestSeed.slotProgressions[0]!
    expect(spellcastingGrantingFeatureDefaultName({ slotProgression: fullCaster })).toBe(
      CLASS_FEATURE_KIND_ENTRIES.spellcasting.label,
    )
  })

  it('prefers authored name for display', () => {
    expect(spellcastingGrantingFeatureDisplayName({ name: '  Arcane Spellcasting  ' })).toBe(
      'Arcane Spellcasting',
    )
    expect(
      spellcastingGrantingFeatureDisplayName({ featureId: PACT_MAGIC_SLOT_PROGRESSION_ID }),
    ).toBe(getSlotProgressionKindLabel(PACT_MAGIC_SLOT_PROGRESSION_ID))
  })
})
