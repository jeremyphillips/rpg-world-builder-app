import {
  EMPTY_SPELLCASTING_PROGRESSION_PATCH,
  computeSpellcastingProgressionSparsePatch,
  resolveSpellcastingProgressionRecords,
  type SlotProgression,
  type SpellcastingProgressionPatch,
  type SystemRulesetId,
} from '@rpg/contracts'
import { loadSpellcastingProgressionSeed } from '@rpg/catalog/spellcasting-progressions'

const DEFAULT_RULESET_ID = 'srd-cc-5.2.1' as const satisfies SystemRulesetId

export type SpellcastingProgressionFormState = {
  slotProgressions: SlotProgression[]
}

export function loadSpellcastingProgressionSeedForRuleset(
  rulesetId: SystemRulesetId = DEFAULT_RULESET_ID,
) {
  return loadSpellcastingProgressionSeed(rulesetId)
}

export function resolveSpellcastingProgressionFormState(
  patch: SpellcastingProgressionPatch | undefined,
  rulesetId: SystemRulesetId = DEFAULT_RULESET_ID,
): SpellcastingProgressionFormState {
  const seed = loadSpellcastingProgressionSeed(rulesetId)
  const resolved = resolveSpellcastingProgressionRecords(seed, patch)
  return {
    slotProgressions: [...resolved.slotProgressions],
  }
}

export function buildSpellcastingProgressionPatchInput(
  state: SpellcastingProgressionFormState,
  rulesetId: SystemRulesetId = DEFAULT_RULESET_ID,
): SpellcastingProgressionPatch {
  const seed = loadSpellcastingProgressionSeed(rulesetId)
  return (
    computeSpellcastingProgressionSparsePatch(
      {
        slotProgressions: state.slotProgressions,
      },
      seed,
    ) ?? EMPTY_SPELLCASTING_PROGRESSION_PATCH
  )
}

export function isSeedSlotProgressionId(
  id: string,
  rulesetId: SystemRulesetId = DEFAULT_RULESET_ID,
): boolean {
  return loadSpellcastingProgressionSeed(rulesetId).slotProgressions.some(
    (entry) => entry.id === id,
  )
}
