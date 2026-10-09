import type { CharacterBuilderDraftEquipmentPurchase } from '../draft/draft'
import type { CharacterBuildAdvisoryFacts } from './character-build-advisory-facts'

/** Picker and manual rows the player added. Package-conversion rows belong to a class package. */
export function isExplicitEquipmentPurchase(
  purchase: CharacterBuilderDraftEquipmentPurchase,
): boolean {
  switch (purchase.sourceMode) {
    case 'manual':
      return true
    case 'startingGold':
      return purchase.origin === 'picker'
  }
}

/**
 * Resolved weapons and armor, plus explicit purchases that are still on the draft
 * because no starting option has funded them. One id per item. Shared by every
 * equipment advisory rule so ownership is projected once.
 */
export function projectEquipmentAdvisorySubjectIds(facts: CharacterBuildAdvisoryFacts): string[] {
  const ids: string[] = []
  const seen = new Set<string>()
  const add = (equipmentId: string) => {
    if (seen.has(equipmentId)) return
    seen.add(equipmentId)
    ids.push(equipmentId)
  }

  for (const entry of [...facts.equipment.weapons, ...facts.equipment.armor]) {
    add(entry.equipmentId)
  }
  for (const purchase of facts.effectiveDraft.equipment?.purchases ?? []) {
    if (!isExplicitEquipmentPurchase(purchase)) continue
    add(purchase.equipmentId)
  }
  return ids
}
