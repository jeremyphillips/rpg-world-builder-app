import type { CharacterClass } from '../../../../content/classes/class'
import type { EquipmentPool } from '../../../../content/lib/equipment-grant'
import type { ToolProficiencyPool } from '../../../../content/lib/proficiency-grant'
import { isMeaningfulToolProficiencyChoice } from '../../../../content/lib/proficiency-grant-set'
import type { StartingEquipmentOption } from '../../../../content/starting-equipment'
import {
  isProficiencyLinkedStartingEquipmentGrant,
  isWealthOnlyStartingEquipmentOption,
  startingEquipmentGrantEquipmentSlug,
} from '../../../../content/starting-equipment'
import type { ToolCategory } from '../../../../vocab/equipment/tool-category'
import { toEquipmentContentId } from '../../../creature/equipment'
import { buildChoiceSetId } from '../../choice-set'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import {
  nestedStartingEquipmentChoiceSetId,
  readSelectedStartingEquipmentOptionId,
} from './resolve-starting-equipment-choice-sets'
import type { EquipmentRecommendationContribution } from './equipment-recommendation-contribution'

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
