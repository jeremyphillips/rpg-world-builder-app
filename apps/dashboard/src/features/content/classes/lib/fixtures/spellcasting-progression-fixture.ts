import { resolveIndexedCampaignSpellcastingProgressionConfig } from '@rpg/catalog/spellcasting-progressions'
import type { ResolvedSpellcastingProgressionConfig, SystemRulesetId } from '@rpg/contracts'

export function srdSpellcastingProgressionFixture(
  rulesetId: SystemRulesetId = 'srd-cc-5.2.1',
): ResolvedSpellcastingProgressionConfig {
  return resolveIndexedCampaignSpellcastingProgressionConfig(rulesetId, undefined)
}
