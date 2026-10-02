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
  filterPackageStartingEquipmentSummaries,
  formatPackageInventoryRowTitle,
  listEquipmentInventoryRowsFromDraft,
} from '@/features/character/lib/equipment/equipment-step.lib'

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

export type QuickNpcEquipmentCategoryStatus = 'none' | 'complete' | 'incomplete'

export function resolveQuickNpcEquipmentCategoryStatus(args: {
  choiceSets: readonly { id: string; required: boolean; min: number; max: number }[]
  draftSelections: Readonly<Record<string, readonly string[]>>
  overrides: Readonly<Record<string, readonly string[]>>
}): QuickNpcEquipmentCategoryStatus {
  const required = args.choiceSets.filter((choiceSet) => choiceSet.required && choiceSet.min > 0)
  if (required.length === 0) return 'none'
  for (const choiceSet of required) {
    const selected = args.overrides[choiceSet.id] ?? args.draftSelections[choiceSet.id] ?? []
    if (selected.length < choiceSet.min || selected.length > choiceSet.max) return 'incomplete'
  }
  return 'complete'
}

export function resolveStartingChoiceEquipmentCategoryLabels(args: {
  context: CharacterBuildContext
  choices: NpcStartingChoices
  setup: QuickNpcSetupValues
  equipmentSelections: readonly { equipmentId: string; quantity: number }[]
  additionalOptionLabels: ReadonlyMap<string, string>
  catalogIndex?: ReturnType<typeof indexCharacterBuildCatalog>
}): string[] {
  const catalogIndex = args.catalogIndex ?? indexCharacterBuildCatalog(args.context.catalog)
  const labels: string[] = [
    ...resolveQuickNpcStartingEquipmentPackageItemLabels({
      context: args.context,
      choices: args.choices,
      setup: args.setup,
    }),
  ]

  for (const selection of args.equipmentSelections) {
    const label = args.additionalOptionLabels.get(selection.equipmentId) ?? selection.equipmentId
    labels.push(
      selection.quantity > 1 ? formatPackageInventoryRowTitle(label, selection.quantity) : label,
    )
  }

  for (const entry of args.choices.contributions) {
    if (!isGrantedEquipmentContribution(entry)) continue
    for (const id of entry.selectedIds) {
      labels.push(catalogIndex.equipment.get(id)?.name ?? id)
    }
  }

  return labels.filter(Boolean)
}
