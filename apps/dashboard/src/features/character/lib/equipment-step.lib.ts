import {
  formatWealth,
  nestedStartingEquipmentChoiceSetId,
  readSelectedStartingEquipmentOptionId,
  resolveEquipmentPoolChoiceOptions,
  equipmentPoolSummaryLabel,
  startingEquipmentChoiceSetId,
  STEP_CHOICE_TYPES_BY_STEP,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterClass,
  type CharacterEquipment,
  type CharacterEquipmentEntry,
  type CharacterSelectionSource,
  type ChoiceSet,
  type StartingEquipmentOptionSummary,
  type StartingEquipmentOptionSummaryGrant,
  type StartingEquipmentOptionSummaryItem,
} from '@rpg/contracts'

export const STARTING_EQUIPMENT_GOLD_OPTION_ID = 'gold'

export const EQUIPMENT_STEP_NO_CLASS_MESSAGE = 'Choose a class before selecting starting equipment.'

export const EQUIPMENT_STEP_NO_STARTING_EQUIPMENT_MESSAGE =
  'No starting equipment choices are required for this class.'

export const EQUIPMENT_STEP_NO_VALID_OPTIONS_MESSAGE =
  'No valid starting equipment options are currently available — this may be caused by missing catalog data.'

export const EQUIPMENT_STEP_CONTINUE_WITHOUT_LABEL = 'Continue without starting equipment'

export const EQUIPMENT_STEP_SWITCH_CONFIRM_HEADLINE = 'Change starting equipment?'

export const EQUIPMENT_STEP_SWITCH_CONFIRM_DESCRIPTION =
  'You customized your equipment after choosing a package. Manual purchases stay in your inventory with their original source. Continue switching?'

export const EQUIPMENT_INVENTORY_GROUP_LABELS = {
  weapons: 'Weapons',
  armor: 'Armor',
  tools: 'Tools',
  gear: 'Gear',
  magicItems: 'Magic Items',
  vehicles: 'Vehicles',
  mounts: 'Mounts',
} as const satisfies Record<keyof CharacterEquipment, string>

const EQUIPMENT_CHOICE_TYPES = STEP_CHOICE_TYPES_BY_STEP.equipment

export type EquipmentInventoryRow = {
  group: keyof CharacterEquipment
  groupLabel: string
  entry: CharacterEquipmentEntry
  equipmentName: string
  sourceLabel: string
}

export type StartingEquipmentNestedPool = {
  itemIndex: number
  choiceSetId: string
  label: string
  options: { id: string; label: string }[]
}

/** ChoiceSets owned by the equipment builder step. */
export function choiceSetsForEquipmentStep(choiceSets: readonly ChoiceSet[]): ChoiceSet[] {
  if (!EQUIPMENT_CHOICE_TYPES) return []

  return choiceSets.filter((choiceSet) => EQUIPMENT_CHOICE_TYPES.has(choiceSet.choiceType))
}

export function findStartingEquipmentChoiceSet(
  choiceSets: readonly ChoiceSet[],
  classId: string,
): ChoiceSet | undefined {
  const choiceSetId = startingEquipmentChoiceSetId(classId)
  return choiceSets.find((choiceSet) => choiceSet.id === choiceSetId)
}

export function isStartingGoldOptionId(optionId: string): boolean {
  return optionId === STARTING_EQUIPMENT_GOLD_OPTION_ID
}

export function hasGoldStartingEquipmentOption(
  summaries: readonly StartingEquipmentOptionSummary[],
): boolean {
  return summaries.some((summary) => isStartingGoldOptionId(summary.optionId))
}

export function hasSelectableStartingEquipmentOption(
  summaries: readonly StartingEquipmentOptionSummary[],
): boolean {
  return summaries.some((summary) => summary.isSelectable)
}

export function shouldShowEquipmentFallback(
  summaries: readonly StartingEquipmentOptionSummary[],
): boolean {
  return summaries.length > 0 && !hasSelectableStartingEquipmentOption(summaries)
}

export function formatStartingEquipmentWealth(
  wealth: StartingEquipmentOptionSummary['wealth'],
): string | undefined {
  if (!wealth) return undefined
  return formatWealth({
    cp: wealth.cp ?? 0,
    sp: wealth.sp ?? 0,
    gp: wealth.gp ?? 0,
    pp: wealth.pp ?? 0,
  })
}

function summarizeGrantItem(item: StartingEquipmentOptionSummaryGrant): string {
  const quantity = item.quantity > 1 ? `${item.quantity}× ` : ''
  const name = item.equipment?.name ?? item.equipmentSlug
  const equipped = item.equipped ? ' (equipped)' : ''
  return `${quantity}${name}${equipped}`
}

function summarizeChoiceItem(
  item: Extract<StartingEquipmentOptionSummaryItem, { kind: 'choice' }>,
): string {
  return `${item.choose}× ${item.poolLabel}`
}

export function formatStartingEquipmentOptionMeta(
  summary: StartingEquipmentOptionSummary,
): string[] {
  const meta: string[] = []

  for (const group of Object.keys(
    EQUIPMENT_INVENTORY_GROUP_LABELS,
  ) as (keyof CharacterEquipment)[]) {
    for (const item of summary.itemsByGroup[group]) {
      meta.push(item.kind === 'grant' ? summarizeGrantItem(item) : summarizeChoiceItem(item))
    }
  }

  const wealth = formatStartingEquipmentWealth(summary.wealth)
  if (wealth) meta.push(wealth)

  return meta
}

export function listNestedPoolsForOption(
  characterClass: CharacterClass,
  optionId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): StartingEquipmentNestedPool[] {
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  const option = startingEquipment?.options.find((entry) => entry.id === optionId)
  if (!option) return []

  return option.items.flatMap((item, itemIndex) => {
    if (item.kind !== 'choice') return []

    return [
      {
        itemIndex,
        choiceSetId: nestedStartingEquipmentChoiceSetId(characterClass.id, optionId, itemIndex),
        label: equipmentPoolSummaryLabel(item.pool),
        options: resolveEquipmentPoolChoiceOptions(
          item.pool,
          catalogIndex,
          characterClass.rulesetId,
        ),
      },
    ]
  })
}

export function areNestedPoolsResolved(
  nestedPools: readonly StartingEquipmentNestedPool[],
  choiceSelections: CharacterBuilderDraft['choiceSelections'],
): boolean {
  if (nestedPools.length === 0) return true

  return nestedPools.every((pool) => (choiceSelections[pool.choiceSetId] ?? []).length > 0)
}

export function readSelectedStartingEquipmentOption(
  draft: CharacterBuilderDraft,
  classId: string | undefined,
): string | undefined {
  if (!classId) return undefined
  return readSelectedStartingEquipmentOptionId(draft, classId)
}

export function formatEquipmentSourceLabel(
  sources: CharacterSelectionSource[] | undefined,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const source = sources?.[0]
  if (!source) return 'Unknown source'

  if (source.kind === 'manual') return 'Added manually'

  if (source.kind === 'startingGold') {
    return 'Purchased with starting gold'
  }

  if (source.kind === 'classStartingEquipment') {
    const characterClass = source.sourceId ? catalogIndex.classes.get(source.sourceId) : undefined
    const className = characterClass?.name ?? 'class'
    return `From ${className} starting equipment`
  }

  return 'Starting equipment'
}

export function listEquipmentInventoryRows(
  inventory: CharacterEquipment,
  catalogIndex: CharacterBuildCatalogIndex,
): EquipmentInventoryRow[] {
  const rows: EquipmentInventoryRow[] = []

  for (const group of Object.keys(
    EQUIPMENT_INVENTORY_GROUP_LABELS,
  ) as (keyof CharacterEquipment)[]) {
    for (const entry of inventory[group]) {
      const equipment = catalogIndex.equipment.get(entry.equipmentId)
      rows.push({
        group,
        groupLabel: EQUIPMENT_INVENTORY_GROUP_LABELS[group],
        entry,
        equipmentName: equipment?.name ?? entry.equipmentId,
        sourceLabel: formatEquipmentSourceLabel(entry.sources, catalogIndex),
      })
    }
  }

  return rows
}

export function buildEquipmentSkipPatch(): CharacterBuilderDraft['equipment'] {
  return {
    mode: 'package',
    purchases: [],
    removedPackageItemKeys: [],
    customized: false,
    skipped: true,
  }
}

export function buildEquipmentSelectionPatch(args: {
  draft: CharacterBuilderDraft
  classId: string
  optionId: string
  choiceSetId: string
  nestedSelections: CharacterBuilderDraft['choiceSelections']
}): Partial<CharacterBuilderDraft> {
  const { draft, optionId, choiceSetId, nestedSelections } = args
  const isGold = isStartingGoldOptionId(optionId)

  return {
    choiceSelections: {
      ...draft.choiceSelections,
      ...nestedSelections,
      [choiceSetId]: [optionId],
    },
    equipment: {
      mode: isGold ? 'gold' : 'package',
      purchases: draft.equipment?.purchases ?? [],
      removedPackageItemKeys: [],
      customized: draft.equipment?.customized ?? false,
      skipped: false,
    },
  }
}
