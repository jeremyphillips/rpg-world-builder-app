import type { CharacterClass } from '../../../../content/classes/class'
import type {
  StartingEquipmentOption,
  StartingEquipmentItem,
} from '../../../../content/starting-equipment'
import {
  isProficiencyLinkedStartingEquipmentGrant,
  isWealthOnlyStartingEquipmentOption,
  startingEquipmentGrantEquipmentSlug,
} from '../../../../content/starting-equipment'
import type { EquipmentRecommendationTier } from '../../../../content/equipment-recommendation'
import { toEquipmentContentId } from '../../../creature/equipment'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import {
  nestedStartingEquipmentChoiceSetId,
  readSelectedStartingEquipmentOptionId,
} from './resolve-starting-equipment-choice-sets'
import type {
  EquipmentRecommendationContribution,
  StartingEquipmentContributionContext,
} from './equipment-recommendation-contribution'

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
  sourceKey: string
  characterClass: CharacterClass
  context: StartingEquipmentContributionContext
  fulfilledIds: Set<string>
}): EquipmentRecommendationContribution[] {
  const { item, sourceKey, characterClass, context, fulfilledIds } = args

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
      sourceKey,
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

  const sourceKey = `${classId}:starting-equipment:${optionId}:${itemIndex}`

  if (item.kind === 'grant') {
    return contributionForStartingGrant({
      item,
      sourceKey,
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
        sourceKey,
      },
    ]
  }

  if (selections.length < choose) {
    return [
      {
        selector: { kind: 'equipment_pool', pool: item.pool },
        tier: 'strong',
        reason: 'startingEquipmentChoice',
        sourceKey,
      },
    ]
  }

  return selections.map((equipmentId) => ({
    selector: { kind: 'equipment', equipmentId },
    tier: 'strong' as const,
    reason: 'startingEquipment' as const,
    sourceKey,
  }))
}

/** Non-wealth starting options used as shopping guidance when gold is selected. */
function listGoldAlternativeStartingOptions(
  startingEquipment: NonNullable<CharacterClass['characterCreation']>['startingEquipment'],
): StartingEquipmentOption[] {
  if (!startingEquipment) return []

  return startingEquipment.options.filter((option) => !isWealthOnlyStartingEquipmentOption(option))
}

function dedupeContributionsBySourceKey(
  contributions: readonly EquipmentRecommendationContribution[],
): EquipmentRecommendationContribution[] {
  const seenSourceKeys = new Set<string>()
  const deduped: EquipmentRecommendationContribution[] = []

  for (const contribution of contributions) {
    if (seenSourceKeys.has(contribution.sourceKey)) continue
    seenSourceKeys.add(contribution.sourceKey)
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
    for (const option of startingEquipment.options) {
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

  const selectedOption = startingEquipment.options.find((option) => option.id === selectedOptionId)
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
    return dedupeContributionsBySourceKey(contributions)
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

  const selectedOption = startingEquipment.options.find((option) => option.id === selectedOptionId)
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
