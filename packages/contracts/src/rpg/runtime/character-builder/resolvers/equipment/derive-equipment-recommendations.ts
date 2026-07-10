import type { CharacterClass } from '../../../../content/classes/class'
import { isSpellcastingActiveAtLevel } from '../../../../content/classes/spellcasting'
import type { Equipment } from '../../../../content/equipment'
import {
  isSpellcastingFocusGearKind,
  type SpellcastingFocusGearKind,
} from '../../../../content/equipment/modifier'
import {
  EQUIPMENT_RECOMMENDATION_TIER_RANK,
  EQUIPMENT_RECOMMENDATION_TIERS,
  NEUTRAL_EQUIPMENT_RECOMMENDATION,
  type EquipmentRecommendation,
  type EquipmentRecommendationReason,
  type EquipmentRecommendationRule,
  type EquipmentRecommendationTier,
} from '../../../../content/equipment-recommendation'
import { listEquipmentMatchingPool, toEquipmentContentId } from '../../../creature/equipment'
import type { CharacterProficiencies } from '../../../character/proficiencies'
import type { CharacterBuildCatalogIndex } from '../../context'
import { isEquipmentProficient } from './is-equipment-proficient'

/** MVP builds level-1 characters; the level-up wizard will pass real levels. */
const DEFAULT_CLASS_LEVEL = 1

export type DeriveEquipmentRecommendationsArgs = {
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  proficiencies: CharacterProficiencies
  classLevel?: number
}

type RecommendationAccumulator = {
  minRank: number
  reasons: Set<EquipmentRecommendationReason>
  label?: string
}

type AccumulatorMap = Map<string, RecommendationAccumulator>

function addContribution(
  accumulators: AccumulatorMap,
  equipmentId: string,
  tier: EquipmentRecommendationTier,
  reason: EquipmentRecommendationReason,
  label?: string,
): void {
  const rank = EQUIPMENT_RECOMMENDATION_TIER_RANK[tier]
  const existing = accumulators.get(equipmentId)

  if (!existing) {
    accumulators.set(equipmentId, { minRank: rank, reasons: new Set([reason]), label })
    return
  }

  existing.reasons.add(reason)
  if (rank < existing.minRank) {
    existing.minRank = rank
    existing.label = label ?? existing.label
  } else if (rank === existing.minRank && existing.label === undefined) {
    existing.label = label
  }
}

/** Named starting-package items: direct grants plus explicit pool entries (filtered pools are too broad). */
function listStartingEquipmentIds(
  characterClass: CharacterClass,
  catalogIndex: CharacterBuildCatalogIndex,
): string[] {
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return []

  const ids: string[] = []
  for (const option of startingEquipment.options) {
    for (const item of option.items) {
      const slugs =
        item.kind === 'grant'
          ? [item.equipmentSlug]
          : item.pool.source === 'explicit'
            ? item.pool.equipmentSlugs
            : []
      for (const slug of slugs) {
        const equipmentId = toEquipmentContentId(characterClass.rulesetId, slug)
        if (catalogIndex.equipment.has(equipmentId)) ids.push(equipmentId)
      }
    }
  }
  return ids
}

/** Item-level tool proficiencies (fixed grants or player picks) signal class tool needs. */
function isClassToolNeed(equipment: Equipment, proficiencies: CharacterProficiencies): boolean {
  if (equipment.kind !== 'tool') return false
  return proficiencies.tools.some(
    (entry) => entry.toolId === equipment.id || entry.toolId === equipment.slug,
  )
}

/** Authored `spellcasting.focus` wins; otherwise infer from focus gear named in starting packages. */
function resolveFocusKinds(
  characterClass: CharacterClass,
  catalogIndex: CharacterBuildCatalogIndex,
  startingEquipmentIds: readonly string[],
): SpellcastingFocusGearKind[] {
  const authored = characterClass.spellcasting?.focus
  if (authored !== undefined) return [...authored]

  const inferred = new Set<SpellcastingFocusGearKind>()
  for (const equipmentId of startingEquipmentIds) {
    const equipment = catalogIndex.equipment.get(equipmentId)
    if (equipment?.kind !== 'adventuring_gear') continue
    if (isSpellcastingFocusGearKind(equipment.gearKind)) inferred.add(equipment.gearKind)
  }
  return [...inferred]
}

function applyAuthoredRules(args: {
  accumulators: AccumulatorMap
  rules: readonly EquipmentRecommendationRule[] | undefined
  tier: EquipmentRecommendationTier
  reason: EquipmentRecommendationReason
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  classLevel: number
}): void {
  const { accumulators, rules, tier, reason, characterClass, catalogIndex, classLevel } = args

  for (const rule of rules ?? []) {
    if (rule.minLevel !== undefined && classLevel < rule.minLevel) continue

    // Soft resolution: unresolved slugs/empty pools match nothing and never block.
    const matches = listEquipmentMatchingPool({
      pool: rule.match,
      equipment: catalogIndex.equipment,
      rulesetId: characterClass.rulesetId,
    })

    for (const equipment of matches) {
      if (rule.tag !== undefined && !(equipment.tags ?? []).includes(rule.tag)) continue
      addContribution(accumulators, equipment.id, tier, reason, rule.label)
    }
  }
}

/** Foci strengthen to essential once the class's spellcasting is active at the current level. */
function applySpellcastingFocusContributions(args: {
  accumulators: AccumulatorMap
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  classLevel: number
  startingEquipmentIds: readonly string[]
}): void {
  const { accumulators, characterClass, catalogIndex, classLevel, startingEquipmentIds } = args
  const spellcasting = characterClass.spellcasting
  if (!spellcasting) return

  const focusKinds = resolveFocusKinds(characterClass, catalogIndex, startingEquipmentIds)
  if (focusKinds.length === 0) return

  const focusTier: EquipmentRecommendationTier = isSpellcastingActiveAtLevel(
    spellcasting,
    classLevel,
  )
    ? 'essential'
    : 'strong'

  for (const equipment of catalogIndex.equipment.values()) {
    if (equipment.kind !== 'adventuring_gear') continue
    if (!(focusKinds as readonly string[]).includes(equipment.gearKind)) continue
    addContribution(accumulators, equipment.id, focusTier, 'spellcastingFocus')
  }
}

function applyProficiencyContributions(
  accumulators: AccumulatorMap,
  equipment: Equipment,
  proficiencies: CharacterProficiencies,
): void {
  if (isClassToolNeed(equipment, proficiencies)) {
    addContribution(accumulators, equipment.id, 'essential', 'classToolNeed')
  }

  if (equipment.kind !== 'weapon' && equipment.kind !== 'armor' && equipment.kind !== 'tool') {
    return
  }

  if (isEquipmentProficient(equipment, proficiencies)) {
    addContribution(accumulators, equipment.id, 'compatible', 'proficient')
  } else {
    addContribution(accumulators, equipment.id, 'notRecommended', 'notProficient')
  }
}

function toRecommendation(accumulator: RecommendationAccumulator): EquipmentRecommendation {
  const tier = EQUIPMENT_RECOMMENDATION_TIERS.find(
    (candidate) => EQUIPMENT_RECOMMENDATION_TIER_RANK[candidate] === accumulator.minRank,
  )!
  return {
    tier,
    reasons: [...accumulator.reasons],
    ...(accumulator.label !== undefined ? { label: accumulator.label } : {}),
  }
}

/**
 * Tiered picker recommendations for every catalog equipment row.
 *
 * Inference-first: starting packages, item-level tool proficiencies, and
 * spellcasting focus kinds are derived from data classes already author.
 * Authored `characterCreation.equipmentRecommendations` rules augment where
 * inference cannot reach; unresolved rule targets are silently skipped.
 */
export function deriveEquipmentRecommendations(
  args: DeriveEquipmentRecommendationsArgs,
): ReadonlyMap<string, EquipmentRecommendation> {
  const { characterClass, catalogIndex, proficiencies } = args
  const classLevel = args.classLevel ?? DEFAULT_CLASS_LEVEL
  const accumulators: AccumulatorMap = new Map()

  const startingEquipmentIds = listStartingEquipmentIds(characterClass, catalogIndex)
  for (const equipmentId of startingEquipmentIds) {
    addContribution(accumulators, equipmentId, 'strong', 'startingEquipment')
  }

  applySpellcastingFocusContributions({
    accumulators,
    characterClass,
    catalogIndex,
    classLevel,
    startingEquipmentIds,
  })

  const authoredRecommendations = characterClass.characterCreation?.equipmentRecommendations
  applyAuthoredRules({
    accumulators,
    rules: authoredRecommendations?.essential,
    tier: 'essential',
    reason: 'classRequired',
    characterClass,
    catalogIndex,
    classLevel,
  })
  applyAuthoredRules({
    accumulators,
    rules: authoredRecommendations?.strong,
    tier: 'strong',
    reason: 'classSuggested',
    characterClass,
    catalogIndex,
    classLevel,
  })

  const recommendations = new Map<string, EquipmentRecommendation>()
  for (const equipment of catalogIndex.equipment.values()) {
    applyProficiencyContributions(accumulators, equipment, proficiencies)
    const accumulator = accumulators.get(equipment.id)
    recommendations.set(
      equipment.id,
      accumulator ? toRecommendation(accumulator) : NEUTRAL_EQUIPMENT_RECOMMENDATION,
    )
  }

  return recommendations
}
