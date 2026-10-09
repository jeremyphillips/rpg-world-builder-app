import type { CharacterClass } from '../../../../content/classes/class'
import type { Equipment } from '../../../../content/equipment'
import type {
  StartingEquipmentOption,
  StartingEquipmentItem,
} from '../../../../content/starting-equipment'
import {
  isProficiencyLinkedStartingEquipmentGrant,
  isWealthOnlyStartingEquipmentOption,
  startingEquipmentGrantEquipmentSlug,
} from '../../../../content/starting-equipment'
import {
  availableStartingEquipmentOptions,
  findAvailableStartingEquipmentOption,
} from '../../../../content/starting-equipment-availability'
import {
  compareEquipmentRecommendationSpecificity,
  type EquipmentRecommendationSpecificity,
  type EquipmentRecommendationTier,
} from '../../../../content/equipment-recommendation'
import { toEquipmentContentId } from '../../../creature/equipment'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import { findClassToolProficiencyChoice } from '../class/find-class-tool-proficiency-choice'
import {
  nestedStartingEquipmentChoiceSetId,
  readSelectedStartingEquipmentOptionId,
} from './resolve-starting-equipment-choice-sets'
import type {
  EquipmentRecommendationContribution,
  StartingEquipmentContributionContext,
} from './equipment-recommendation-contribution'
import { sourceForEquipmentReason } from './equipment-recommendation-evidence'
import {
  expandRecommendationSelector,
  type EquipmentRecommendationSelector,
} from './equipment-recommendation-selector'
import { specificityForSelectorExpansion } from './equipment-recommendation-specificity'

/**
 * Class starting-equipment relevance for browse strength.
 * Walks every available option. Direct grants are exact. Choice pools and
 * proficiency-linked grants use the expansion specificity of their pool.
 * The selected package, fulfilled grants, the gold path, and proficiency
 * answers do not change the result.
 */
export function listClassStartingEquipmentCandidateSpecificity(args: {
  characterClass: CharacterClass
  equipment: ReadonlyMap<string, Equipment>
}): Map<string, EquipmentRecommendationSpecificity> {
  const specificityById = new Map<string, EquipmentRecommendationSpecificity>()
  const startingEquipment = args.characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return specificityById

  const rulesetId = args.characterClass.rulesetId
  for (const option of availableStartingEquipmentOptions(startingEquipment.options)) {
    for (const item of option.items) {
      recordStartingItemCandidate(
        specificityById,
        args.characterClass,
        args.equipment,
        rulesetId,
        item,
      )
    }
  }

  return specificityById
}

function recordStartingItemCandidate(
  specificityById: Map<string, EquipmentRecommendationSpecificity>,
  characterClass: CharacterClass,
  equipment: ReadonlyMap<string, Equipment>,
  rulesetId: string,
  item: StartingEquipmentItem,
): void {
  if (item.kind !== 'grant') {
    recordPoolSpecificity(specificityById, equipment, rulesetId, {
      kind: 'equipment_pool',
      pool: item.pool,
    })
    return
  }

  if (isProficiencyLinkedStartingEquipmentGrant(item)) {
    const choice = findClassToolProficiencyChoice(characterClass, item.target.choiceId)
    if (!choice?.pool) return
    recordPoolSpecificity(specificityById, equipment, rulesetId, {
      kind: 'tool_proficiency_pool',
      pool: choice.pool,
    })
    return
  }

  const slug = startingEquipmentGrantEquipmentSlug(item)
  if (!slug) return
  const equipmentId = toEquipmentContentId(rulesetId, slug)
  if (!equipment.has(equipmentId)) return
  preferStartingEquipmentSpecificity(specificityById, equipmentId, 'exact')
}

function recordPoolSpecificity(
  specificityById: Map<string, EquipmentRecommendationSpecificity>,
  equipment: ReadonlyMap<string, Equipment>,
  rulesetId: string,
  selector: EquipmentRecommendationSelector,
): void {
  const matches = expandRecommendationSelector({ selector, equipment, rulesetId })
  const specificity = specificityForSelectorExpansion(selector, matches.length)
  for (const match of matches) {
    preferStartingEquipmentSpecificity(specificityById, match.id, specificity)
  }
}

function preferStartingEquipmentSpecificity(
  specificityById: Map<string, EquipmentRecommendationSpecificity>,
  equipmentId: string,
  specificity: EquipmentRecommendationSpecificity,
): void {
  const current = specificityById.get(equipmentId)
  if (
    current === undefined ||
    compareEquipmentRecommendationSpecificity(specificity, current) < 0
  ) {
    specificityById.set(equipmentId, specificity)
  }
}

function listFulfilledPackageEquipmentIds(args: {
  selectedOption: StartingEquipmentOption
  classId: string
  optionId: string
  draft: CharacterBuilderDraft
  rulesetId: string
}): Set<string> {
  const { selectedOption, classId, optionId, draft, rulesetId } = args
  const fulfilled = new Set<string>()

  for (const [itemIndex, item] of selectedOption.items.entries()) {
    if (item.kind === 'grant') {
      const slug = startingEquipmentGrantEquipmentSlug(item)
      if (slug) fulfilled.add(toEquipmentContentId(rulesetId, slug))
      continue
    }

    const choiceSetId = nestedStartingEquipmentChoiceSetId(classId, optionId, itemIndex)
    for (const equipmentId of draft.choiceSelections[choiceSetId] ?? []) {
      fulfilled.add(equipmentId)
    }
  }

  return fulfilled
}

function tierForAvailableInStartingOption(
  context: StartingEquipmentContributionContext,
): EquipmentRecommendationTier {
  return context === 'unselected_option' ? 'compatible' : 'strong'
}

function contributionForStartingGrant(args: {
  item: Extract<StartingEquipmentItem, { kind: 'grant' }>
  dedupeKey: string
  characterClass: CharacterClass
  context: StartingEquipmentContributionContext
  fulfilledIds: Set<string>
}): EquipmentRecommendationContribution[] {
  const { item, dedupeKey, characterClass, context, fulfilledIds } = args

  if (isProficiencyLinkedStartingEquipmentGrant(item)) return []

  const slug = startingEquipmentGrantEquipmentSlug(item)
  if (!slug) return []

  const equipmentId = toEquipmentContentId(characterClass.rulesetId, slug)
  if (fulfilledIds.has(equipmentId)) return []

  return [
    {
      selector: { kind: 'equipment', equipmentId },
      tier: tierForAvailableInStartingOption(context),
      reason: 'availableInStartingOption',
      dedupeKey,
      source: sourceForEquipmentReason('availableInStartingOption', characterClass.id),
    },
  ]
}

function contributionForStartingItem(args: {
  item: StartingEquipmentItem
  itemIndex: number
  optionId: string
  classId: string
  characterClass: CharacterClass
  draft: CharacterBuilderDraft
  context: StartingEquipmentContributionContext
  fulfilledIds: Set<string>
}): EquipmentRecommendationContribution[] {
  const { item, itemIndex, optionId, classId, characterClass, draft, context, fulfilledIds } = args

  const dedupeKey = `${classId}:starting-equipment:${optionId}:${itemIndex}`
  const source = sourceForEquipmentReason('availableInStartingOption', classId)

  if (item.kind === 'grant') {
    return contributionForStartingGrant({
      item,
      dedupeKey,
      characterClass,
      context,
      fulfilledIds,
    })
  }

  if (item.kind !== 'choice') return []

  const choiceSetId = nestedStartingEquipmentChoiceSetId(classId, optionId, itemIndex)
  const selections = draft.choiceSelections[choiceSetId] ?? []
  const choose = item.choose ?? 1

  if (context === 'unselected_option') {
    return [
      {
        selector: { kind: 'equipment_pool', pool: item.pool },
        tier: 'compatible',
        reason: 'availableInStartingOption',
        dedupeKey,
        source,
      },
    ]
  }

  if (selections.length < choose) {
    return [
      {
        selector: { kind: 'equipment_pool', pool: item.pool },
        tier: 'strong',
        reason: 'startingEquipmentChoice',
        dedupeKey,
        source,
        choiceSetId,
      },
    ]
  }

  return selections.map((equipmentId) => ({
    selector: { kind: 'equipment', equipmentId },
    tier: 'strong' as const,
    reason: 'startingEquipment' as const,
    dedupeKey: `${dedupeKey}:${equipmentId}`,
    source,
    choiceSetId,
  }))
}

/** Non-wealth starting options used as shopping guidance when gold is selected. */
function listGoldAlternativeStartingOptions(
  startingEquipment: NonNullable<CharacterClass['characterCreation']>['startingEquipment'],
): StartingEquipmentOption[] {
  if (!startingEquipment) return []

  return availableStartingEquipmentOptions(startingEquipment.options).filter(
    (option) => !isWealthOnlyStartingEquipmentOption(option),
  )
}

function dedupeContributionsByKey(
  contributions: readonly EquipmentRecommendationContribution[],
): EquipmentRecommendationContribution[] {
  const seenKeys = new Set<string>()
  const deduped: EquipmentRecommendationContribution[] = []

  for (const contribution of contributions) {
    if (seenKeys.has(contribution.dedupeKey)) continue
    seenKeys.add(contribution.dedupeKey)
    deduped.push(contribution)
  }

  return deduped
}

function contributionsForStartingOption(args: {
  option: StartingEquipmentOption
  classId: string
  characterClass: CharacterClass
  draft: CharacterBuilderDraft
  context: StartingEquipmentContributionContext
  fulfilledIds: Set<string>
}): EquipmentRecommendationContribution[] {
  const { option, classId, characterClass, draft, context, fulfilledIds } = args

  return option.items.flatMap((item, itemIndex) =>
    contributionForStartingItem({
      item,
      itemIndex,
      optionId: option.id,
      classId,
      characterClass,
      draft,
      context,
      fulfilledIds,
    }),
  )
}

export function deriveStartingEquipmentRecommendationContributions(args: {
  characterClass: CharacterClass
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
}): EquipmentRecommendationContribution[] {
  const { characterClass, draft } = args
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return []

  const classId = characterClass.id
  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  const contributions: EquipmentRecommendationContribution[] = []

  if (!selectedOptionId) {
    for (const option of availableStartingEquipmentOptions(startingEquipment.options)) {
      if (isWealthOnlyStartingEquipmentOption(option)) continue

      contributions.push(
        ...contributionsForStartingOption({
          option,
          classId,
          characterClass,
          draft,
          context: 'unselected_option',
          fulfilledIds: new Set(),
        }),
      )
    }
    return contributions
  }

  const selectedOption = findAvailableStartingEquipmentOption(
    startingEquipment.options,
    selectedOptionId,
  )
  if (!selectedOption) return []

  if (isWealthOnlyStartingEquipmentOption(selectedOption)) {
    for (const option of listGoldAlternativeStartingOptions(startingEquipment)) {
      contributions.push(
        ...contributionsForStartingOption({
          option,
          classId,
          characterClass,
          draft,
          context: 'gold_alternative',
          fulfilledIds: new Set(),
        }),
      )
    }
    return dedupeContributionsByKey(contributions)
  }

  const fulfilledIds = listFulfilledPackageEquipmentIds({
    selectedOption,
    classId,
    optionId: selectedOptionId,
    draft,
    rulesetId: characterClass.rulesetId,
  })

  contributions.push(
    ...contributionsForStartingOption({
      option: selectedOption,
      classId,
      characterClass,
      draft,
      context: 'selected_package',
      fulfilledIds,
    }),
  )

  return contributions
}

/** Explicit grant ids from the selected starting package — used for spellcasting focus inference. */
export function listSelectedStartingEquipmentGrantIds(args: {
  characterClass: CharacterClass
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
}): string[] {
  const { characterClass, draft, catalogIndex } = args
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return []

  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, characterClass.id)
  if (!selectedOptionId) return []

  const selectedOption = findAvailableStartingEquipmentOption(
    startingEquipment.options,
    selectedOptionId,
  )
  if (!selectedOption) return []

  const ids: string[] = []
  for (const item of selectedOption.items) {
    if (item.kind !== 'grant') continue
    const slug = startingEquipmentGrantEquipmentSlug(item)
    if (!slug) continue
    const equipmentId = toEquipmentContentId(characterClass.rulesetId, slug)
    if (catalogIndex.equipment.has(equipmentId)) ids.push(equipmentId)
  }
  return ids
}
