import type { CharacterClass } from '../../../../content/classes/class'
import { isSpellcastingActiveAtLevel } from '../../../../content/classes/spellcasting/class-spellcasting-ownership'
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
  GLOBAL_RECOMMENDATION_SCOPE,
  resolveEquipmentPresentationFacts,
  type EquipmentOpenPoolKind,
  type RecommendationSourceName,
  type RecommendationSourceRef,
} from '../../recommendation'
import { getNpcTemplateLabel, type NpcTemplateId } from '../../../../vocab/npc/npc-template'
import {
  listOwnedEquipmentIds,
  projectEquipmentCatalogFacts,
} from './project-equipment-option-facts'
import { specificityForMatchCount } from './equipment-recommendation-specificity'

/** MVP builds level-1 characters; the level-up wizard will pass real levels. */
const DEFAULT_CLASS_LEVEL = 1

/** Class is the derive argument. Role, title, species, and user preferences are optional peers. */
export type EquipmentRecommendationContext = {
  speciesId?: string
  roleId?: NpcTemplateId
  title?: { organizationId: string; titleId: string }
  userEquipmentPreferenceSlugs?: readonly string[]
  titleEquipmentPreferenceSlugs?: readonly string[]
  roleEquipmentPreferenceSlugs?: readonly string[]
}

export type DeriveEquipmentRecommendationsArgs = {
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  proficiencies: CharacterProficiencies
  classLevel?: number
  draft?: CharacterBuilderDraft
  choiceSets?: readonly ChoiceSet[]
  recommendationContext?: EquipmentRecommendationContext
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
        selectedClassId: characterClass.id,
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
        selectedClassId: args.characterClass.id,
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
        selectedClassId: args.characterClass.id,
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
          selectedClassId: characterClass.id,
        },
      )
    }
  }

  return matches.map((equipment) => equipment.id)
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
      selectedClassId: characterClass.id,
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

  applyContextEquipmentPreferences({
    accumulators,
    catalogIndex,
    recommendationContext: args.recommendationContext,
    selectedClassId: characterClass.id,
  })

  const recommendations = new Map<string, DerivedEquipmentRecommendation>()
  for (const equipment of catalogIndex.equipment.values()) {
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

  const sourceName = equipmentRecommendationSourceName(catalogIndex)
  for (const [equipmentId, recommendation] of recommendations) {
    const resolved = facts.get(equipmentId)
    if (!resolved) continue
    recommendations.set(equipmentId, {
      ...recommendation,
      resolved: {
        ...resolved,
        presentation: resolveEquipmentPresentationFacts({
          resolved,
          equipment: catalogIndex.equipment.get(equipmentId),
          sourceName,
          authoredLabel: recommendation.label,
          openPoolKind: openPoolKindFromEvidence(recommendation.evidence),
        }),
      },
    })
  }

  return recommendations
}

function applyContextEquipmentPreferences(args: {
  accumulators: AccumulatorMap
  catalogIndex: CharacterBuildCatalogIndex
  recommendationContext: EquipmentRecommendationContext | undefined
  selectedClassId: string
}): void {
  const context = args.recommendationContext
  if (!context) return
  const selectedClassId = args.selectedClassId
  if (context.userEquipmentPreferenceSlugs?.length) {
    applyEquipmentPreferenceSignals({
      accumulators: args.accumulators,
      catalogIndex: args.catalogIndex,
      slugs: context.userEquipmentPreferenceSlugs,
      source: { kind: 'user' },
      selectedClassId,
    })
  }
  if (
    context.title &&
    context.titleEquipmentPreferenceSlugs &&
    context.titleEquipmentPreferenceSlugs.length > 0
  ) {
    applyEquipmentPreferenceSignals({
      accumulators: args.accumulators,
      catalogIndex: args.catalogIndex,
      slugs: context.titleEquipmentPreferenceSlugs,
      source: {
        kind: 'title',
        organizationId: context.title.organizationId,
        titleId: context.title.titleId,
      },
      selectedClassId,
    })
  }
  if (context.roleId && context.roleEquipmentPreferenceSlugs?.length) {
    applyEquipmentPreferenceSignals({
      accumulators: args.accumulators,
      catalogIndex: args.catalogIndex,
      slugs: context.roleEquipmentPreferenceSlugs,
      source: { kind: 'role', id: context.roleId },
      selectedClassId,
    })
  }
}

/**
 * Preference slugs are soft signals. The legacy reason stays `classSuggested` so the
 * tier lift is unchanged; provenance is the source ref, not a new reason.
 */
function applyEquipmentPreferenceSignals(args: {
  accumulators: AccumulatorMap
  catalogIndex: CharacterBuildCatalogIndex
  slugs: readonly string[]
  source: RecommendationSourceRef
  selectedClassId: string
}): void {
  const slugs = new Set(args.slugs)
  for (const equipment of args.catalogIndex.equipment.values()) {
    if (!slugs.has(equipment.slug)) continue
    addRecommendationContribution(
      args.accumulators,
      equipment.id,
      'strong',
      'classSuggested',
      'exact',
      {
        source: args.source,
        basis: 'preference',
        scope: GLOBAL_RECOMMENDATION_SCOPE,
        selectedClassId: args.selectedClassId,
      },
    )
  }
}

function equipmentRecommendationSourceName(
  catalogIndex: CharacterBuildCatalogIndex,
): RecommendationSourceName {
  return (source) => {
    if (source.kind === 'class') return catalogIndex.classes.get(source.id)?.name
    if (source.kind === 'species') return catalogIndex.species.get(source.id)?.name
    if (source.kind === 'role') return getNpcTemplateLabel(source.id)
    return undefined
  }
}

function openPoolKindFromEvidence(
  evidence: readonly { reason: string }[],
): EquipmentOpenPoolKind | undefined {
  if (evidence.some((entry) => entry.reason === 'unresolvedToolProficiencyChoice')) {
    return 'toolProficiency'
  }
  if (evidence.some((entry) => entry.reason === 'startingEquipmentChoice')) {
    return 'startingEquipment'
  }
  return undefined
}
