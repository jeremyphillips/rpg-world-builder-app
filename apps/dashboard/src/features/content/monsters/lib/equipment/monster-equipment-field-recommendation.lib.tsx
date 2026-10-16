import type { FieldRecommendationGroup } from '@rpg/ui'

import {
  formatMonsterEquipmentBulkAddAriaLabel,
  MONSTER_EQUIPMENT_PROFICIENCY_RECOMMENDATIONS_SOURCE,
  MONSTER_EQUIPMENT_RECOMMENDATION_ADD_LABEL,
} from '../monster-form-labels'

import {
  resolveMonsterEquipmentWeaponRecommendations,
  type MonsterEquipmentRecommendationCandidate,
} from './resolve-monster-equipment-recommendations.lib'
import type { MonsterEquipmentFormEntry } from '../monster-form-values'
import type { Equipment, SystemRulesetId } from '@rpg/contracts'

export function buildMonsterEquipmentRecommendationGroup(input: {
  weaponProficiencyItemIds: readonly string[]
  referenceEquipment: readonly Equipment[]
  equipmentEntries: readonly MonsterEquipmentFormEntry[]
  rulesetId: SystemRulesetId
  onAddEquipment: (equipmentId: string) => void
  onAddAllEquipment: (equipmentIds: readonly string[]) => void
}): FieldRecommendationGroup | null {
  const candidates = resolveMonsterEquipmentWeaponRecommendations({
    weaponProficiencyItemIds: input.weaponProficiencyItemIds,
    referenceEquipment: input.referenceEquipment,
    equipmentEntries: input.equipmentEntries,
    rulesetId: input.rulesetId,
  })

  if (candidates.length === 0) return null

  const equipmentIds = candidates.map((candidate) => candidate.equipmentId)

  return {
    sourceLabel: MONSTER_EQUIPMENT_PROFICIENCY_RECOMMENDATIONS_SOURCE,
    items: candidates.map((candidate) => toRecommendationItem(candidate, input.onAddEquipment)),
    bulkAction: {
      label: 'Add all',
      ariaLabel: formatMonsterEquipmentBulkAddAriaLabel(candidates.length),
      onClick: () => input.onAddAllEquipment(equipmentIds),
    },
  }
}

function toRecommendationItem(
  candidate: MonsterEquipmentRecommendationCandidate,
  onAddEquipment: (equipmentId: string) => void,
) {
  return {
    id: candidate.equipmentId,
    label: candidate.label,
    action: {
      label: MONSTER_EQUIPMENT_RECOMMENDATION_ADD_LABEL,
      ariaLabel: `Add ${candidate.label}`,
      onClick: () => onAddEquipment(candidate.equipmentId),
    },
  }
}
