import { resolveCampaignXpProgressionEntries } from '@rpg/catalog/xp-progressions'
import type {
  ResolvedCampaignCharacterCreationProgression,
  SystemRulesetId,
  XpProgressionEntry,
} from '@rpg/contracts'

export function resolveEffectiveMaxFromProgression(
  progression: ResolvedCampaignCharacterCreationProgression,
): number {
  return progression.extendedProgression?.maxLevel ?? progression.maxCharacterLevel
}

export function resolveCampaignXpProgressionForRules(
  rulesetId: SystemRulesetId,
  progression: ResolvedCampaignCharacterCreationProgression,
): Pick<{ entries: XpProgressionEntry[] }, 'entries'> {
  return {
    entries: resolveCampaignXpProgressionEntries(rulesetId, {
      xpThresholds: progression.xpThresholds,
      effectiveMaxLevel: resolveEffectiveMaxFromProgression(progression),
    }),
  }
}
