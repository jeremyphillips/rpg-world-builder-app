import {
  indexCharacterBuildCatalog,
  readSelectedStartingEquipmentOptionId,
  resolveAvailableChoices,
  resolveStartingEquipmentChoiceSets,
  resolveStartingEquipmentOptionSummaries,
  startingEquipmentChoiceSetId,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type NpcStartingChoices,
  type StartingChoiceContribution,
} from '@rpg/contracts'

import type { QuickNpcSetupValues } from './quick-npc-form-fields'
import {
  formatStartingChoiceCategorySummary,
  resolveQuickNpcStartingChoices,
} from './quick-npc-starting-choices.lib'
import {
  filterPackageStartingEquipmentSummaries,
  formatPackageInventoryRowTitle,
  listEquipmentInventoryRowsFromDraft,
} from '@/features/character/lib/equipment/equipment-step.lib'

import type { QuickNpcCreateContext } from './quick-npc-create-context'

const PACKAGE_GRANT_SOURCE_KINDS = new Set(['classStartingEquipment', 'startingGold'])

export function formatStartingChoiceItemCount(count: number): string {
  return count === 1 ? '1 item' : `${count} items`
}

export function isGrantedEquipmentContribution(
  contribution: StartingChoiceContribution,
): contribution is StartingChoiceContribution & {
  mechanic: 'fixed-grant'
  category: 'equipment'
} {
  return (
    contribution.mechanic === 'fixed-grant' &&
    contribution.category === 'equipment' &&
    !PACKAGE_GRANT_SOURCE_KINDS.has(contribution.source.kind)
  )
}

export function resolveQuickNpcRecommendedStartingChoices(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
  createContext: QuickNpcCreateContext
  startingChoiceOverrides?: Record<string, readonly string[]>
  requiredSpellIds?: readonly string[]
}): NpcStartingChoices {
  const overrides = { ...(args.startingChoiceOverrides ?? {}) }
  const classId = args.setup.classId
  if (classId) {
    delete overrides[startingEquipmentChoiceSetId(classId)]
  }

  return resolveQuickNpcStartingChoices({
    setup: args.setup,
    context: args.context,
    createContext: args.createContext,
    startingChoiceOverrides: overrides,
    requiredWeaponIds: [],
    requiredSpellIds: args.requiredSpellIds ?? [],
  })
}

export function resolveQuickNpcStartingEquipmentPackageContext(args: {
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
  choices: NpcStartingChoices
}): {
  characterClass: ReturnType<ReturnType<typeof indexCharacterBuildCatalog>['classes']['get']>
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>
  summaries: ReturnType<typeof resolveStartingEquipmentOptionSummaries>
  resolvedChoiceSets: ReturnType<typeof resolveAvailableChoices>
  draft: CharacterBuilderDraft
  selectedOptionId: string | undefined
  startingEquipmentChoiceSetId: string | undefined
} | null {
  const classId = args.setup.classId
  if (!classId) return null

  const catalogIndex = indexCharacterBuildCatalog(args.context.catalog)
  const characterClass = catalogIndex.classes.get(classId)
  if (!characterClass?.characterCreation?.startingEquipment) return null

  const summaries = resolveStartingEquipmentOptionSummaries(
    characterClass,
    catalogIndex,
    args.choices.draft,
  )
  if (filterPackageStartingEquipmentSummaries(characterClass, summaries).length === 0) {
    return null
  }

  const resolvedChoiceSets = resolveStartingEquipmentChoiceSets(
    args.choices.draft,
    characterClass,
    catalogIndex,
  )
  const choiceSetId = startingEquipmentChoiceSetId(classId)
  const startingChoiceSet = resolvedChoiceSets.find((choiceSet) => choiceSet.id === choiceSetId)

  return {
    characterClass,
    catalogIndex,
    summaries,
    resolvedChoiceSets,
    draft: args.choices.draft,
    selectedOptionId: readSelectedStartingEquipmentOptionId(args.choices.draft, classId),
    startingEquipmentChoiceSetId: startingChoiceSet?.id,
  }
}

export function resolveQuickNpcStartingEquipmentPackageItemLabels(args: {
  context: CharacterBuildContext
  choices: NpcStartingChoices
  setup: QuickNpcSetupValues
}): string[] {
  const packageContext = resolveQuickNpcStartingEquipmentPackageContext({
    setup: args.setup,
    context: args.context,
    choices: args.choices,
  })
  if (!packageContext?.selectedOptionId) return []

  return listEquipmentInventoryRowsFromDraft(
    args.choices.draft,
    packageContext.catalogIndex,
    undefined,
    args.context,
  )
    .filter((row) => row.removeTarget?.kind === 'package')
    .map((row) => {
      const quantity = row.entry.quantity
      return quantity > 1
        ? formatPackageInventoryRowTitle(row.equipmentName, quantity)
        : row.equipmentName
    })
}

export function resolveStartingChoiceEquipmentCategoryLabels(args: {
  context: CharacterBuildContext
  choices: NpcStartingChoices
  setup: QuickNpcSetupValues
  additionalEquipmentIds: readonly string[]
  additionalOptionLabels: ReadonlyMap<string, string>
}): string[] {
  const labels: string[] = [
    ...resolveQuickNpcStartingEquipmentPackageItemLabels({
      context: args.context,
      choices: args.choices,
      setup: args.setup,
    }),
  ]

  for (const equipmentId of args.additionalEquipmentIds) {
    const label = args.additionalOptionLabels.get(equipmentId) ?? equipmentId
    labels.push(label)
  }

  for (const entry of args.choices.contributions) {
    if (!isGrantedEquipmentContribution(entry)) continue
    for (const id of entry.selectedIds) {
      const catalog = indexCharacterBuildCatalog(args.context.catalog)
      labels.push(catalog.equipment.get(id)?.name ?? id)
    }
  }

  return labels.filter(Boolean)
}

export function startingChoiceEquipmentCategorySummary(args: {
  context: CharacterBuildContext
  choices: NpcStartingChoices
  setup: QuickNpcSetupValues
  additionalEquipmentIds: readonly string[]
  additionalOptionLabels: ReadonlyMap<string, string>
}): string {
  return formatStartingChoiceCategorySummary(resolveStartingChoiceEquipmentCategoryLabels(args))
}
