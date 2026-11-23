import type { EquipmentCatalogScope } from '@rpg/contracts'

/** Authoritative equipment scope from content form context — no silent default ruleset. */
export function equipmentReferenceScopeFromContentFormCtx(input: {
  rulesetId: string | undefined
  campaignId: string | undefined
}): EquipmentCatalogScope | undefined {
  if (!input.rulesetId) return undefined
  return {
    rulesetId: input.rulesetId,
    campaignId: input.campaignId ?? '',
  }
}
