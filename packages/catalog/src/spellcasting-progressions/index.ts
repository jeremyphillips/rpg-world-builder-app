import {
  indexSpellcastingProgressionRecords,
  resolveSpellcastingProgressionRecords,
  slotProgressionSchema,
  type ResolvedSpellcastingProgressionConfig,
  type SpellcastingProgressionPatch,
  type SpellcastingProgressionSeed,
} from '@rpg/contracts'
import type { SystemRulesetId } from '@rpg/contracts'

import slotProgressionsRaw from './data/srd-cc-5.2.1/slot-progressions.json'

const slotProgressionSeedSchema = slotProgressionSchema.array().min(1)

const SRD_521_SLOT_PROGRESSIONS = slotProgressionSeedSchema.parse(slotProgressionsRaw)

const SEED_BY_RULESET = {
  'srd-cc-5.2.1': {
    slotProgressions: SRD_521_SLOT_PROGRESSIONS,
  },
} as const satisfies Record<SystemRulesetId, SpellcastingProgressionSeed>

export function loadSpellcastingProgressionSeed(
  rulesetId: SystemRulesetId,
): SpellcastingProgressionSeed {
  return SEED_BY_RULESET[rulesetId]
}

export function resolveCampaignSpellcastingProgressionConfig(
  rulesetId: SystemRulesetId,
  patch: SpellcastingProgressionPatch | undefined,
): SpellcastingProgressionSeed {
  return resolveSpellcastingProgressionRecords(loadSpellcastingProgressionSeed(rulesetId), patch)
}

export function resolveIndexedCampaignSpellcastingProgressionConfig(
  rulesetId: SystemRulesetId,
  patch: SpellcastingProgressionPatch | undefined,
): ResolvedSpellcastingProgressionConfig {
  return indexSpellcastingProgressionRecords(
    resolveCampaignSpellcastingProgressionConfig(rulesetId, patch),
  )
}
