import type { Equipment } from '../../../../content/equipment'
import type { GearKind } from '../../../../vocab/equipment/gear-kind'

/** Gear kinds that classify adventuring gear as a spellcasting focus bucket. */
const SPELLCASTING_FOCUS_GEAR_KINDS: ReadonlySet<GearKind> = new Set([
  'arcane_focus',
  'druidic_focus',
  'holy_symbol',
])

/**
 * Browse-sort bucket rank for equipment kind — lower ranks list first.
 * Tiebreaker only: must not outrank peers with a better tier or reason.
 */
export const EQUIPMENT_RECOMMENDATION_KIND_RANK = {
  weapon: 0,
  shield: 1,
  armor: 2,
  tool: 3,
  spellcastingFocus: 4,
  gear: 5,
  ammunition: 6,
  other: 7,
} as const

export type EquipmentRecommendationKindBucket = keyof typeof EQUIPMENT_RECOMMENDATION_KIND_RANK

/** Maps catalog equipment to a browse-sort kind bucket (no pack bucket). */
export function getEquipmentRecommendationKindRank(equipment: Equipment): number {
  return EQUIPMENT_RECOMMENDATION_KIND_RANK[getEquipmentRecommendationKindBucket(equipment)]
}

function getEquipmentRecommendationKindBucket(
  equipment: Equipment,
): EquipmentRecommendationKindBucket {
  switch (equipment.kind) {
    case 'weapon':
      return 'weapon'
    case 'armor':
      return equipment.category === 'shields' ? 'shield' : 'armor'
    case 'tool':
      return 'tool'
    case 'adventuring_gear': {
      const { gearKind } = equipment
      if (SPELLCASTING_FOCUS_GEAR_KINDS.has(gearKind)) return 'spellcastingFocus'
      if (gearKind === 'ammunition') return 'ammunition'
      return 'gear'
    }
    default:
      return 'other'
  }
}
