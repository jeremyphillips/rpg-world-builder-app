import type { CharacterClass } from '../../../../content/classes/class'
import type { EquipmentPool } from '../../../../content/lib/equipment-grant'
import type { ToolProficiencyPool } from '../../../../content/lib/proficiency-grant'
import { isMeaningfulToolProficiencyChoice } from '../../../../content/lib/proficiency-grant-set'
import type {
  StartingEquipmentOption,
  StartingEquipmentItem,
} from '../../../../content/starting-equipment'
import {
  isProficiencyLinkedStartingEquipmentGrant,
  isWealthOnlyStartingEquipmentOption,
  startingEquipmentGrantEquipmentSlug,
} from '../../../../content/starting-equipment'
import type { ToolCategory } from '../../../../vocab/equipment/tool-category'
import type {
  EquipmentRecommendationReason,
  EquipmentRecommendationTier,
} from '../../../../content/equipment-recommendation'
import { toEquipmentContentId } from '../../../creature/equipment'
import { buildChoiceSetId } from '../../choice-set'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import {
  nestedStartingEquipmentChoiceSetId,
  readSelectedStartingEquipmentOptionId,
} from './resolve-starting-equipment-choice-sets'
import type { EquipmentRecommendationSelector } from './equipment-recommendation-selector'
import { expandRecommendationSelector } from './equipment-recommendation-selector'
import { specificityForSelectorExpansion } from './equipment-recommendation-specificity'
import {
  addRecommendationContribution,
  type AccumulatorMap,
} from './equipment-recommendation-accumulator'

export type EquipmentRecommendationContribution = {
  selector: EquipmentRecommendationSelector
  tier: EquipmentRecommendationTier
  reason: EquipmentRecommendationReason
  sourceKey: string
  excludeEquipmentIds?: ReadonlySet<string>
}

/** Controls tier/reason when deriving starting-equipment shopping guidance. */
export type StartingEquipmentContributionContext =
  | 'unselected_option'
  | 'selected_package'
  | 'gold_alternative'

export function poolHasSemanticCategories(pool: ToolProficiencyPool): boolean {
  return pool.source === 'filtered' && (pool.toolCategories?.length ?? 0) > 0
}

export function categoryOnlyToolProficiencyPool(
  pool: ToolProficiencyPool,
): Extract<ToolProficiencyPool, { source: 'filtered' }> | undefined {
  if (!poolHasSemanticCategories(pool)) return undefined
  if (pool.source !== 'filtered') return undefined
  return { source: 'filtered', toolCategories: pool.toolCategories }
}

export function isGoldShoppingPath(
  _draft: CharacterBuilderDraft,
  selectedOption: StartingEquipmentOption | undefined,
): boolean {
  return selectedOption !== undefined && isWealthOnlyStartingEquipmentOption(selectedOption)
}

function equipmentPoolOverlapsToolCategories(
  pool: EquipmentPool,
  categories: readonly ToolCategory[],
): boolean {
  if (pool.source !== 'filtered' || pool.equipmentKind !== 'tool' || !pool.toolCategory) {
    return false
  }
  return categories.includes(pool.toolCategory)
}

function toolMatchesCategoryPool(
  equipmentId: string,
  categories: readonly ToolCategory[],
  catalogIndex: CharacterBuildCatalogIndex,
): boolean {
  const equipment = catalogIndex.equipment.get(equipmentId)
  return equipment?.kind === 'tool' && categories.includes(equipment.toolCategory)
}

export function selectedPackageGrantsMatchingToolCategories(args: {
  selectedOption: StartingEquipmentOption
  toolCategories: readonly ToolCategory[]
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
}): boolean {
  const { selectedOption, toolCategories, characterClass, catalogIndex } = args
  const { rulesetId } = characterClass

  for (const item of selectedOption.items) {
    if (item.kind !== 'grant' || isProficiencyLinkedStartingEquipmentGrant(item)) continue

    const slug = startingEquipmentGrantEquipmentSlug(item)
    if (!slug) continue

    const equipmentId = toEquipmentContentId(rulesetId, slug)
    if (toolMatchesCategoryPool(equipmentId, toolCategories, catalogIndex)) return true
  }

  return false
}

export function selectedPackageResolvesMatchingEquipmentChoice(args: {
  selectedOption: StartingEquipmentOption
  classId: string
  toolCategories: readonly ToolCategory[]
  draft: CharacterBuilderDraft
  characterClass: CharacterClass
  optionId: string
}): boolean {
  const { selectedOption, classId, toolCategories, draft, optionId } = args

  for (const [itemIndex, item] of selectedOption.items.entries()) {
    if (item.kind !== 'choice') continue
    if (!equipmentPoolOverlapsToolCategories(item.pool, toolCategories)) continue

    const choiceSetId = nestedStartingEquipmentChoiceSetId(classId, optionId, itemIndex)
    const selections = draft.choiceSelections[choiceSetId] ?? []
    if (selections.length < (item.choose ?? 1)) continue

    return true
  }

  return false
}

export function hasUnfulfilledCategoryEquipmentNeed(args: {
  draft: CharacterBuilderDraft
  selectedOption: StartingEquipmentOption | undefined
  categoryPool: ToolProficiencyPool
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  classId: string
  optionId: string | undefined
}): boolean {
  const { draft, selectedOption, categoryPool, characterClass, catalogIndex, classId, optionId } =
    args

  if (!poolHasSemanticCategories(categoryPool)) return false
  if (!isGoldShoppingPath(draft, selectedOption)) return false

  const categories = categoryPool.source === 'filtered' ? (categoryPool.toolCategories ?? []) : []

  if (
    selectedOption &&
    optionId &&
    selectedPackageGrantsMatchingToolCategories({
      selectedOption,
      toolCategories: categories,
      characterClass,
      catalogIndex,
    })
  ) {
    return false
  }

  if (
    selectedOption &&
    optionId &&
    selectedPackageResolvesMatchingEquipmentChoice({
      selectedOption,
      classId,
      toolCategories: categories,
      draft,
      characterClass,
      optionId,
    })
  ) {
    return false
  }

  return true
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

function applyContribution(
  accumulators: AccumulatorMap,
  contribution: EquipmentRecommendationContribution,
  catalogIndex: CharacterBuildCatalogIndex,
  rulesetId: string,
): void {
  const matches = expandRecommendationSelector({
    selector: contribution.selector,
    equipment: catalogIndex.equipment,
    rulesetId,
  })
  const specificity = specificityForSelectorExpansion(contribution.selector, matches.length)

  for (const equipment of matches) {
    if (contribution.excludeEquipmentIds?.has(equipment.id)) continue

    addRecommendationContribution(
      accumulators,
      equipment.id,
      contribution.tier,
      contribution.reason,
      contribution.sourceKey,
      specificity,
    )
  }
}

function fixedClassToolContributions(
  characterClass: CharacterClass,
): EquipmentRecommendationContribution[] {
  const classId = characterClass.id
  return (characterClass.proficiencies.tools?.items ?? []).map((toolReference) => ({
    selector: { kind: 'equipment' as const, equipmentId: toolReference },
    tier: 'essential' as const,
    reason: 'classToolNeed' as const,
    sourceKey: `${classId}:fixed-tool:${toolReference}`,
  }))
}

function contributionsForResolvedToolChoice(args: {
  choiceSetId: string
  selections: readonly string[]
}): EquipmentRecommendationContribution[] {
  const { choiceSetId, selections } = args

  return selections.map((optionId) => ({
    selector: { kind: 'equipment' as const, equipmentId: optionId },
    tier: 'strong' as const,
    reason: 'selectedToolProficiency' as const,
    sourceKey: choiceSetId,
  }))
}

function contributionForUnresolvedToolChoice(args: {
  choiceSetId: string
  pool: ToolProficiencyPool
  selectedIds: ReadonlySet<string>
}): EquipmentRecommendationContribution {
  const { choiceSetId, pool, selectedIds } = args

  return {
    selector: { kind: 'tool_proficiency_pool', pool },
    tier: 'strong',
    reason: 'unresolvedToolProficiencyChoice',
    sourceKey: choiceSetId,
    excludeEquipmentIds: selectedIds,
  }
}

function contributionForPersistentToolCategory(args: {
  choiceSetId: string
  pool: ToolProficiencyPool
  selectedIds: ReadonlySet<string>
  draft: CharacterBuilderDraft
  selectedOption: StartingEquipmentOption | undefined
  selectedOptionId: string | undefined
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  classId: string
}): EquipmentRecommendationContribution | undefined {
  const {
    choiceSetId,
    pool,
    selectedIds,
    draft,
    selectedOption,
    selectedOptionId,
    characterClass,
    catalogIndex,
    classId,
  } = args

  const categoryPool = categoryOnlyToolProficiencyPool(pool)
  if (!categoryPool) return undefined

  const elevateCategory = hasUnfulfilledCategoryEquipmentNeed({
    draft,
    selectedOption,
    categoryPool,
    characterClass,
    catalogIndex,
    classId,
    optionId: selectedOptionId,
  })

  return {
    selector: { kind: 'tool_proficiency_pool', pool: categoryPool },
    tier: elevateCategory ? 'strong' : 'compatible',
    reason: 'classToolCategory',
    sourceKey: `${choiceSetId}:category`,
    excludeEquipmentIds: selectedIds,
  }
}

function contributionsForToolProficiencyChoice(args: {
  choice: { id: string; choose: number; pool?: ToolProficiencyPool }
  draft: CharacterBuilderDraft
  selectedOption: StartingEquipmentOption | undefined
  selectedOptionId: string | undefined
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  classId: string
}): EquipmentRecommendationContribution[] {
  const { choice, draft, selectedOption, selectedOptionId, characterClass, catalogIndex, classId } =
    args

  if (!isMeaningfulToolProficiencyChoice(choice) || !choice.pool) return []

  const choiceSetId = buildChoiceSetId('class', classId, choice.id)
  const selections = draft.choiceSelections[choiceSetId] ?? []
  const selectedIds = new Set(selections)
  const contributions = contributionsForResolvedToolChoice({ choiceSetId, selections })

  if (selections.length < choice.choose) {
    contributions.push(
      contributionForUnresolvedToolChoice({
        choiceSetId,
        pool: choice.pool,
        selectedIds,
      }),
    )
    return contributions
  }

  if (choice.choose > 1) {
    const categoryContribution = contributionForPersistentToolCategory({
      choiceSetId,
      pool: choice.pool,
      selectedIds,
      draft,
      selectedOption,
      selectedOptionId,
      characterClass,
      catalogIndex,
      classId,
    })
    if (categoryContribution) contributions.push(categoryContribution)
  }

  return contributions
}

export function deriveProficiencyRecommendationContributions(args: {
  characterClass: CharacterClass
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
}): EquipmentRecommendationContribution[] {
  const { characterClass, draft, catalogIndex } = args
  const classId = characterClass.id
  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  const selectedOption = startingEquipment?.options.find((option) => option.id === selectedOptionId)

  const toolChoices = characterClass.characterCreation?.proficiencies?.tools?.choices ?? []

  return [
    ...fixedClassToolContributions(characterClass),
    ...toolChoices.flatMap((choice) =>
      contributionsForToolProficiencyChoice({
        choice,
        draft,
        selectedOption,
        selectedOptionId,
        characterClass,
        catalogIndex,
        classId,
      }),
    ),
  ]
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

export function applyRecommendationContributions(args: {
  accumulators: AccumulatorMap
  contributions: readonly EquipmentRecommendationContribution[]
  catalogIndex: CharacterBuildCatalogIndex
  rulesetId: string
}): void {
  const { accumulators, contributions, catalogIndex, rulesetId } = args

  for (const contribution of contributions) {
    applyContribution(accumulators, contribution, catalogIndex, rulesetId)
  }
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
