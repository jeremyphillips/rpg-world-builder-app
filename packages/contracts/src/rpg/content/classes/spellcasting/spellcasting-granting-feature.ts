import { spellcastingFeatureLabelForSlotProgression } from '../../../campaign/rules/spellcasting-progression/resolve-slots'
import type { SlotProgression } from '../../../campaign/rules/spellcasting-progression/slot-progression'
import {
  getSlotProgressionKindLabel,
  PACT_MAGIC_SLOT_PROGRESSION_KIND_ID,
} from '../../../vocab/spell/slot-progression-kind'

import { CLASS_FEATURE_KIND_ENTRIES } from '../class'

/** Class spellcasting granting feature id for Pact Magic progression. */
export const PACT_MAGIC_SLOT_PROGRESSION_ID = PACT_MAGIC_SLOT_PROGRESSION_KIND_ID

export const SPELLCASTING_GRANTING_FEATURE_ID = 'spellcasting' as const

export type SpellcastingGrantingFeatureId =
  | typeof SPELLCASTING_GRANTING_FEATURE_ID
  | typeof PACT_MAGIC_SLOT_PROGRESSION_ID

export function usesPactMagicSlotProgression(input: {
  slotProgression?: Pick<SlotProgression, 'kind'>
  slotProgressionId?: string
}): boolean {
  return (
    input.slotProgression?.kind === 'pact' ||
    input.slotProgressionId === PACT_MAGIC_SLOT_PROGRESSION_ID
  )
}

export function spellcastingGrantingFeatureId(input: {
  slotProgression?: Pick<SlotProgression, 'kind'>
  slotProgressionId?: string
}): SpellcastingGrantingFeatureId {
  return usesPactMagicSlotProgression(input)
    ? PACT_MAGIC_SLOT_PROGRESSION_ID
    : SPELLCASTING_GRANTING_FEATURE_ID
}

export function spellcastingGrantingFeatureDefaultName(input: {
  slotProgression?: Pick<SlotProgression, 'kind'>
  slotProgressionId?: string
}): string {
  if (input.slotProgression) {
    return spellcastingFeatureLabelForSlotProgression(input.slotProgression as SlotProgression)
  }
  if (usesPactMagicSlotProgression(input)) {
    return getSlotProgressionKindLabel(PACT_MAGIC_SLOT_PROGRESSION_ID)
  }
  return CLASS_FEATURE_KIND_ENTRIES.spellcasting.label
}

export function spellcastingGrantingFeatureDisplayName(input: {
  name?: string | null
  featureId?: string
  slotProgressionId?: string
  slotProgression?: Pick<SlotProgression, 'kind'>
}): string {
  const trimmed = String(input.name ?? '').trim()
  if (trimmed) return trimmed

  const slotProgressionId =
    input.slotProgressionId ??
    (input.featureId === PACT_MAGIC_SLOT_PROGRESSION_ID
      ? PACT_MAGIC_SLOT_PROGRESSION_ID
      : undefined)

  return spellcastingGrantingFeatureDefaultName({
    slotProgression: input.slotProgression,
    slotProgressionId,
  })
}
