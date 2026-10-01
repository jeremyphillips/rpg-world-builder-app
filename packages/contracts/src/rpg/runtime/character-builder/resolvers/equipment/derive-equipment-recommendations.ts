import type { CharacterClass } from '../../../../content/classes/class'
import { isSpellcastingActiveAtLevel } from '../../../../content/classes/spellcasting/class-spellcasting-ownership'
import type { Equipment } from '../../../../content/equipment'
import { getEquipmentSpellcastingGearKind } from '../../../../content/equipment/adventuring-gear-variant'
import type { SpellcastingFocusGearKind } from '../../../../content/equipment/modifier'
import {
  isWealthOnlyStartingEquipmentOption,
  startingEquipmentGrantEquipmentSlug,
} from '../../../../content/starting-equipment'
import { availableStartingEquipmentOptions } from '../../../../content/starting-equipment-availability'
import {
  isSpellcastingFocusGearKind,
  type SpellcastingGearKind,
} from '../../../../vocab/equipment/spellcasting-gear-kind'
import {
  NEUTRAL_EQUIPMENT_RECOMMENDATION,
  type EquipmentRecommendationRule,
  type EquipmentRecommendationTier,
} from '../../../../content/equipment-recommendation'
import { listEquipmentMatchingPool, toEquipmentContentId } from '../../../creature/equipment'
import type { CharacterProficiencies } from '../../../character/sheet/proficiencies'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import type { ChoiceSet } from '../../choice-set'
import { isEquipmentProficient } from './is-equipment-proficient'
import {
  addRecommendationContribution,
  toEquipmentRecommendation,
  type AccumulatorMap,
  type DerivedEquipmentRecommendation,
} from './equipment-recommendation-accumulator'
import {
  applyRecommendationContributions,
  deriveProficiencyRecommendationContributions,
  deriveStartingEquipmentRecommendationContributions,
  listSelectedStartingEquipmentGrantIds,
} from './derive-equipment-recommendation-contributions'
import { classRecommendationSource } from './equipment-recommendation-evidence'
import {
  listOwnedEquipmentIds,
  projectEquipmentCatalogFacts,
} from './project-equipment-option-facts'
import { specificityForMatchCount } from './equipment-recommendation-specificity'

/** MVP builds level-1 characters; the level-up wizard will pass real levels. */
const DEFAULT_CLASS_LEVEL = 1

export type DeriveEquipmentRecommendationsArgs = {
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  proficiencies: CharacterProficiencies
  classLevel?: number
  draft?: CharacterBuilderDraft
  choiceSets?: readonly ChoiceSet[]
}

/** Named starting-package items for focus inference when no package is selected yet. */
function listFallbackStartingEquipmentGrantIds(
  characterClass: CharacterClass,
  catalogIndex: CharacterBuildCatalogIndex,
): string[] {
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return []

  const ids: string[] = []
  for (const option of availableStartingEquipmentOptions(startingEquipment.options)) {
    if (isWealthOnlyStartingEquipmentOption(option)) continue

    for (const item of option.items) {
      if (item.kind !== 'grant') continue
      const equipmentSlug = startingEquipmentGrantEquipmentSlug(item)
      if (!equipmentSlug) continue
      const equipmentId = toEquipmentContentId(characterClass.rulesetId, equipmentSlug)
      if (catalogIndex.equipment.has(equipmentId)) ids.push(equipmentId)
    }
  }
  return ids
}

function resolveFocusInferenceIds(
  characterClass: CharacterClass,
  catalogIndex: CharacterBuildCatalogIndex,
  draft: CharacterBuilderDraft | undefined,
): string[] {
  if (!draft) return listFallbackStartingEquipmentGrantIds(characterClass, catalogIndex)

  const selectedIds = listSelectedStartingEquipmentGrantIds({
    characterClass,
    draft,
    catalogIndex,
  })
  if (selectedIds.length > 0) return selectedIds

  return listFallbackStartingEquipmentGrantIds(characterClass, catalogIndex)
}

/** Authored `spellcasting.focusKinds` wins; otherwise infer from focus gear in starting packages. */
function resolveFocusKinds(
  characterClass: CharacterClass,
  catalogIndex: CharacterBuildCatalogIndex,
  startingEquipmentIds: readonly string[],
): SpellcastingFocusGearKind[] {
  const authored = characterClass.spellcasting?.focusKinds
  if (authored !== undefined) return [...authored]

  const inferred = new Set<SpellcastingFocusGearKind>()
  for (const equipmentId of startingEquipmentIds) {
    const equipment = catalogIndex.equipment.get(equipmentId)
    if (equipment?.kind !== 'adventuring_gear') continue
    const spellcastingGearKind = getEquipmentSpellcastingGearKind(equipment)
    if (spellcastingGearKind !== undefined && isSpellcastingFocusGearKind(spellcastingGearKind)) {
      inferred.add(spellcastingGearKind)
    }
  }
  return [...inferred]
}

function applyAuthoredRules(args: {
  accumulators: AccumulatorMap
  rules: readonly EquipmentRecommendationRule[] | undefined
  tier: EquipmentRecommendationTier
  reason: 'classRequired' | 'classSuggested'
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  classLevel: number
}): void {
  const { accumulators, rules, tier, reason, characterClass, catalogIndex, classLevel } = args

  for (const rule of rules ?? []) {
    if (rule.minLevel !== undefined && classLevel < rule.minLevel) continue

    const matches = listEquipmentMatchingPool({
      pool: rule.match,
      equipment: catalogIndex.equipment,
      rulesetId: characterClass.rulesetId,
    })
    const specificity = specificityForMatchCount(matches.length)

    for (const equipment of matches) {
      if (rule.tag !== undefined && !(equipment.tags ?? []).includes(rule.tag)) continue
      addRecommendationContribution(accumulators, equipment.id, tier, reason, specificity, {
        source: classRecommendationSource(characterClass.id),
        basis: 'authored',
        label: rule.label,
      })
    }
  }
}

function applyRequiredGearContributions(args: {
  accumulators: AccumulatorMap
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
}): void {
  const requiredGear = args.characterClass.spellcasting?.requiredGear
  if (!requiredGear || requiredGear.length === 0) return

  const matches = [...args.catalogIndex.equipment.values()].filter((equipment) => {
    const spellcastingGearKind = getEquipmentSpellcastingGearKind(equipment)
    return (
      spellcastingGearKind !== undefined &&
      (requiredGear as readonly string[]).includes(spellcastingGearKind)
    )
  })
  const specificity = specificityForMatchCount(matches.length)

  for (const equipment of matches) {
    addRecommendationContribution(
      args.accumulators,
      equipment.id,
      'essential',
      'classRequired',
      specificity,
      {
        source: classRecommendationSource(args.characterClass.id),
        basis: 'inferred',
      },
    )
  }
}

function applyRecommendedGearContributions(args: {
  accumulators: AccumulatorMap
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
}): void {
  const recommendedGear = args.characterClass.spellcasting?.recommendedGear
  if (!recommendedGear || recommendedGear.length === 0) return

  const matches = [...args.catalogIndex.equipment.values()].filter((equipment) => {
    const spellcastingGearKind = getEquipmentSpellcastingGearKind(equipment)
    return (
      spellcastingGearKind !== undefined &&
      (recommendedGear as readonly SpellcastingGearKind[]).includes(spellcastingGearKind)
    )
  })
  const specificity = specificityForMatchCount(matches.length)

  for (const equipment of matches) {
    addRecommendationContribution(
      args.accumulators,
      equipment.id,
      'strong',
      'classSuggested',
      specificity,
      {
        source: classRecommendationSource(args.characterClass.id),
        basis: 'inferred',
      },
    )
  }
}

function applySpellcastingFocusContributions(args: {
  accumulators: AccumulatorMap
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  classLevel: number
  startingEquipmentIds: readonly string[]
  ownedIds: ReadonlySet<string>
}): string[] {
  const { accumulators, characterClass, catalogIndex, classLevel, startingEquipmentIds, ownedIds } =
    args
  const spellcasting = characterClass.spellcasting
  if (!spellcasting) return []

  const focusKinds = resolveFocusKinds(characterClass, catalogIndex, startingEquipmentIds)
  if (focusKinds.length === 0) return []

  const focusTier: EquipmentRecommendationTier = isSpellcastingActiveAtLevel(
    characterClass,
    classLevel,
    { runtime: true },
  )
    ? 'essential'
    : 'strong'

  const matches = [...catalogIndex.equipment.values()].filter((equipment) => {
    if (equipment.kind !== 'adventuring_gear') return false
    const spellcastingGearKind = getEquipmentSpellcastingGearKind(equipment)
    return (
      spellcastingGearKind !== undefined &&
      (focusKinds as readonly string[]).includes(spellcastingGearKind)
    )
  })
  const specificity = specificityForMatchCount(matches.length)
  const satisfied = matches.some((equipment) => ownedIds.has(equipment.id))

  if (!satisfied) {
    for (const equipment of matches) {
      addRecommendationContribution(
        accumulators,
        equipment.id,
        focusTier,
        'spellcastingFocus',
        specificity,
        {
          source: classRecommendationSource(characterClass.id),
          basis: 'inferred',
        },
      )
    }
  }

  return matches.map((equipment) => equipment.id)
}

function applyProficiencyContributions(
  accumulators: AccumulatorMap,
  equipment: Equipment,
  proficiencies: CharacterProficiencies,
): void {
  if (equipment.kind !== 'weapon' && equipment.kind !== 'armor' && equipment.kind !== 'tool') {
    return
  }

  if (isEquipmentProficient(equipment, proficiencies)) {
    addRecommendationContribution(accumulators, equipment.id, 'compatible', 'proficient', 'exact')
  } else {
    addRecommendationContribution(
      accumulators,
      equipment.id,
      'notRecommended',
      'notProficient',
      'exact',
    )
  }
}

/**
 * Tiered picker recommendations for every catalog equipment row.
 *
 * Inference-first: proficiency pools, starting-equipment pools, item-level tool
 * proficiencies, and spellcasting gear kinds are derived from data classes
 * already author. Authored `characterCreation.equipmentRecommendations` rules
 * augment where inference cannot reach.
 */
export function deriveEquipmentRecommendations(
  args: DeriveEquipmentRecommendationsArgs,
): ReadonlyMap<string, DerivedEquipmentRecommendation> {
  const { characterClass, catalogIndex, proficiencies, draft, choiceSets } = args
  const classLevel = args.classLevel ?? DEFAULT_CLASS_LEVEL
  const accumulators: AccumulatorMap = new Map()

  if (draft && choiceSets) {
    applyRecommendationContributions({
      accumulators,
      contributions: [
        ...deriveProficiencyRecommendationContributions({
          characterClass,
          draft,
          catalogIndex,
        }),
        ...deriveStartingEquipmentRecommendationContributions({
          characterClass,
          draft,
          catalogIndex,
        }),
      ],
      catalogIndex,
      rulesetId: characterClass.rulesetId,
    })
  }

  const startingEquipmentIds = resolveFocusInferenceIds(characterClass, catalogIndex, draft)
  const ownedIds = listOwnedEquipmentIds({ characterClass, catalogIndex, draft })

  applyRequiredGearContributions({
    accumulators,
    characterClass,
    catalogIndex,
  })

  const focusEligibleIds = applySpellcastingFocusContributions({
    accumulators,
    characterClass,
    catalogIndex,
    classLevel,
    startingEquipmentIds,
    ownedIds,
  })

  applyRecommendedGearContributions({
    accumulators,
    characterClass,
    catalogIndex,
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

  const recommendations = new Map<string, DerivedEquipmentRecommendation>()
  for (const equipment of catalogIndex.equipment.values()) {
    applyProficiencyContributions(accumulators, equipment, proficiencies)
    const accumulator = accumulators.get(equipment.id)
    recommendations.set(
      equipment.id,
      accumulator
        ? toEquipmentRecommendation(accumulator)
        : { ...NEUTRAL_EQUIPMENT_RECOMMENDATION, evidence: [] },
    )
  }

  const evidenceById = new Map(
    [...recommendations.entries()].map(([equipmentId, recommendation]) => [
      equipmentId,
      recommendation.evidence,
    ]),
  )
  const facts = projectEquipmentCatalogFacts({
    classId: characterClass.id,
    equipment: catalogIndex.equipment,
    evidenceById,
    proficiencies,
    focusEligibleIds,
    ownedIds,
  })

  for (const [equipmentId, recommendation] of recommendations) {
    const resolved = facts.get(equipmentId)
    if (resolved) recommendations.set(equipmentId, { ...recommendation, resolved })
  }

  return recommendations
}
