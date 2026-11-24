import type { CharacterRulesScope, EquipmentCatalogScope } from '@rpg/contracts'

/** Maps authoritative character rules scope to equipment reference lookup boundaries. */
export function equipmentReferenceScopeFromCharacterRulesScope(
  rulesScope: CharacterRulesScope,
): EquipmentCatalogScope {
  if (rulesScope.type === 'campaign') {
    return {
      rulesetId: rulesScope.rulesetId,
      campaignId: rulesScope.campaignId,
    }
  }
  return {
    rulesetId: rulesScope.rulesetId,
    campaignId: '',
  }
}
