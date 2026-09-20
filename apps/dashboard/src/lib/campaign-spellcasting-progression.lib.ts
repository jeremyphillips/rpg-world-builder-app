import type { ResolvedSpellcastingProgressionConfig, SystemRulesetId } from '@rpg/contracts'
import type { SpellcastingProgressionPatch } from '@rpg/contracts'
import { resolveIndexedCampaignSpellcastingProgressionConfig } from '@rpg/catalog/spellcasting-progressions'

/** Resolved spellcasting progression records for a campaign ruleset (seed + sparse patch). */
export function resolveCampaignSpellcastingProgression(
  rulesetId: SystemRulesetId,
  patch: SpellcastingProgressionPatch | undefined,
): ResolvedSpellcastingProgressionConfig {
  return resolveIndexedCampaignSpellcastingProgressionConfig(rulesetId, patch)
}
