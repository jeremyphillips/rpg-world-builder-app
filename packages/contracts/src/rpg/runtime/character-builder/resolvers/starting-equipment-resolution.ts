import type { ArmorEquipment, Equipment } from '../../../content/equipment'
import { isArmorEquipment } from '../../../content/equipment'
import type {
  EquipmentChoiceGrant,
  FixedEquipmentGrant,
} from '../../../content/lib/equipment-grant'
import { formatEquipmentPoolLabel } from '../../../content/lib/equipment-grant'
import type { CharacterWealthGrant } from '../../../content/lib/wealth-grant'
import type {
  StartingEquipmentItem,
  StartingEquipmentOption,
} from '../../../content/starting-equipment'
import { resolveEquipmentContentId } from '../../../content/starting-equipment'
import type { CharacterClass } from '../../../content/classes/class'
import type { CharacterEquipment } from '../../character/equipment-inventory'
import type { CharacterEquipmentEntry } from '../../character/equipment-inventory'
import type { CharacterWealth } from '../../character/equipment-inventory'
import type { CharacterSelectionSource } from '../../character/selection-sources'
import { buildChoiceSetId, type ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft'
import { resolveEquipmentPoolChoiceOptions, toEquipmentContentId } from './equipment-pool-options'

const EMPTY_EQUIPMENT: CharacterEquipment = {
  weapons: [],
  armor: [],
  tools: [],
  gear: [],
  magicItems: [],
  vehicles: [],
  mounts: [],
}

type EquipmentInventoryBucket = keyof Omit<CharacterEquipment, never>

const EQUIPMENT_KIND_TO_BUCKET = {
  weapon: 'weapons',
  armor: 'armor',
  tool: 'tools',
  adventuring_gear: 'gear',
  magic_item: 'magicItems',
  vehicle: 'vehicles',
  mount: 'mounts',
  service: 'gear',
} as const satisfies Record<Equipment['kind'], EquipmentInventoryBucket>

export function startingEquipmentChoiceSetId(classId: string): string {
  return buildChoiceSetId('class', classId, 'starting-equipment')
}

export function nestedStartingEquipmentChoiceSetId(
  classId: string,
  optionId: string,
  itemIndex: number,
): string {
  return buildChoiceSetId('class', classId, `starting-equipment:${optionId}:${itemIndex}`)
}

export function readSelectedStartingEquipmentOptionId(
  draft: CharacterBuilderDraft,
  classId: string,
): string | undefined {
  return draft.choiceSelections[startingEquipmentChoiceSetId(classId)]?.[0]
}

export type ResolvedStartingEquipmentFixedItem = {
  kind: 'fixed'
  grant: FixedEquipmentGrant
  equipmentId: string
  equipment: Equipment | undefined
}

export type ResolvedStartingEquipmentItemChoice = {
  kind: 'choice'
  grant: EquipmentChoiceGrant
  choiceSetId: string
  selectedEquipmentId: string | undefined
  equipment: Equipment | undefined
}

export type ResolvedStartingEquipmentItem =
  | ResolvedStartingEquipmentFixedItem
  | ResolvedStartingEquipmentItemChoice

/** Resolved starting-equipment option with catalog lookups for finalize and BENCH-095. */
export type ResolvedStartingEquipmentOption = {
  option: StartingEquipmentOption
  items: ResolvedStartingEquipmentItem[]
  wealth: CharacterWealthGrant | undefined
}

function classStartingEquipmentSource(
  classId: string,
  optionId: string,
): CharacterSelectionSource[] {
  return [{ kind: 'classStartingEquipment', sourceId: classId, grantId: optionId }]
}

function wealthGrantToCharacterWealth(grant: CharacterWealthGrant | undefined): CharacterWealth {
  return {
    cp: grant?.cp ?? 0,
    sp: grant?.sp ?? 0,
    gp: grant?.gp ?? 0,
    pp: grant?.pp ?? 0,
  }
}

function resolveFixedItem(
  grant: FixedEquipmentGrant,
  rulesetId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): ResolvedStartingEquipmentFixedItem {
  const equipmentId = toEquipmentContentId(rulesetId, grant.equipmentSlug)
  return {
    kind: 'fixed',
    grant,
    equipmentId,
    equipment: catalogIndex.equipment.get(equipmentId),
  }
}

function resolveItemChoice(
  grant: EquipmentChoiceGrant,
  classId: string,
  optionId: string,
  itemIndex: number,
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): ResolvedStartingEquipmentItemChoice {
  const choiceSetId = nestedStartingEquipmentChoiceSetId(classId, optionId, itemIndex)
  const selectedEquipmentId = draft.choiceSelections[choiceSetId]?.[0]
  return {
    kind: 'choice',
    grant,
    choiceSetId,
    selectedEquipmentId,
    equipment: selectedEquipmentId ? catalogIndex.equipment.get(selectedEquipmentId) : undefined,
  }
}

/** Resolves a starting-equipment option with catalog lookups for the selected package. */
export function resolveStartingEquipmentOption(
  characterClass: CharacterClass,
  option: StartingEquipmentOption,
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): ResolvedStartingEquipmentOption {
  const rulesetId = characterClass.rulesetId

  return {
    option,
    wealth: option.wealth,
    items: option.items.map((item, itemIndex) =>
      item.kind === 'fixed'
        ? resolveFixedItem(item, rulesetId, catalogIndex)
        : resolveItemChoice(item, characterClass.id, option.id, itemIndex, draft, catalogIndex),
    ),
  }
}

function equipmentEntryFromGrant(
  equipmentId: string,
  grant: FixedEquipmentGrant,
  sources: CharacterSelectionSource[],
): CharacterEquipmentEntry {
  return {
    equipmentId,
    quantity: grant.quantity ?? 1,
    equipped: grant.equipped,
    modifiers: grant.modifiers,
    sources,
  }
}

function appendEquipmentEntry(
  inventory: CharacterEquipment,
  equipment: Equipment,
  entry: CharacterEquipmentEntry,
): CharacterEquipment {
  const bucket = EQUIPMENT_KIND_TO_BUCKET[equipment.kind]
  return {
    ...inventory,
    [bucket]: [...inventory[bucket], entry],
  }
}

function appendResolvedItem(
  inventory: CharacterEquipment,
  item: ResolvedStartingEquipmentItem,
  sources: CharacterSelectionSource[],
): CharacterEquipment {
  if (item.kind === 'fixed') {
    if (!item.equipment) return inventory
    return appendEquipmentEntry(
      inventory,
      item.equipment,
      equipmentEntryFromGrant(item.equipmentId, item.grant, sources),
    )
  }

  if (!item.selectedEquipmentId || !item.equipment) return inventory

  return appendEquipmentEntry(inventory, item.equipment, {
    equipmentId: item.selectedEquipmentId,
    quantity: 1,
    sources,
  })
}

/** Assembles finalized equipment and wealth from the selected starting-equipment package. */
export function assembleStartingEquipment(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): { equipment: CharacterEquipment; wealth: CharacterWealth } {
  const classId = draft.class.classId
  if (!classId) {
    return { equipment: EMPTY_EQUIPMENT, wealth: wealthGrantToCharacterWealth(undefined) }
  }

  const characterClass = catalogIndex.classes.get(classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  if (!startingEquipment) {
    return { equipment: EMPTY_EQUIPMENT, wealth: wealthGrantToCharacterWealth(undefined) }
  }

  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  if (!selectedOptionId) {
    return { equipment: EMPTY_EQUIPMENT, wealth: wealthGrantToCharacterWealth(undefined) }
  }

  const option = startingEquipment.options.find((entry) => entry.id === selectedOptionId)
  if (!option) {
    return { equipment: EMPTY_EQUIPMENT, wealth: wealthGrantToCharacterWealth(undefined) }
  }

  const resolved = resolveStartingEquipmentOption(characterClass!, option, draft, catalogIndex)
  const sources = classStartingEquipmentSource(classId, selectedOptionId)

  const equipment = resolved.items.reduce(
    (inventory, item) => appendResolvedItem(inventory, item, sources),
    EMPTY_EQUIPMENT,
  )

  return {
    equipment,
    wealth: wealthGrantToCharacterWealth(resolved.wealth),
  }
}

export function resolveEquippedArmorVariants(
  equipment: CharacterEquipment,
  catalogIndex: CharacterBuildCatalogIndex,
): ArmorEquipment[] {
  return equipment.armor.flatMap((entry) => {
    if (!entry.equipped) return []
    const item = catalogIndex.equipment.get(entry.equipmentId)
    return item && isArmorEquipment(item) ? [item] : []
  })
}

function nestedChoiceSetForItem(
  characterClass: CharacterClass,
  optionId: string,
  item: Extract<StartingEquipmentItem, { kind: 'choice' }>,
  itemIndex: number,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet {
  const choose = item.choose ?? 1
  return {
    id: nestedStartingEquipmentChoiceSetId(characterClass.id, optionId, itemIndex),
    sourceType: 'class',
    sourceId: characterClass.id,
    choiceType: 'equipment',
    label: formatEquipmentPoolLabel(item.pool),
    min: choose,
    max: choose,
    options: resolveEquipmentPoolChoiceOptions(item.pool, catalogIndex, characterClass.rulesetId),
    required: true,
  }
}

export function resolveStartingEquipmentChoiceSets(
  draft: CharacterBuilderDraft,
  characterClass: CharacterClass,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet[] {
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return []

  const choiceSets: ChoiceSet[] = [
    {
      id: startingEquipmentChoiceSetId(characterClass.id),
      sourceType: 'class',
      sourceId: characterClass.id,
      choiceType: 'equipment',
      label: 'Choose Starting Equipment',
      min: startingEquipment.choose,
      max: startingEquipment.choose,
      options: startingEquipment.options.map((option) => ({
        id: option.id,
        label: option.label,
        description: option.description,
      })),
      required: true,
    },
  ]

  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, characterClass.id)
  if (!selectedOptionId) return choiceSets

  const selectedOption = startingEquipment.options.find((option) => option.id === selectedOptionId)
  if (!selectedOption) return choiceSets

  for (const [itemIndex, item] of selectedOption.items.entries()) {
    if (item.kind !== 'choice') continue
    choiceSets.push(
      nestedChoiceSetForItem(characterClass, selectedOptionId, item, itemIndex, catalogIndex),
    )
  }

  return choiceSets
}

/** Returns true when a fixed starting item slug resolves in the catalog. */
export function isStartingFixedItemAvailable(
  rulesetId: string,
  grant: FixedEquipmentGrant,
  catalogIndex: CharacterBuildCatalogIndex,
): boolean {
  return catalogIndex.equipment.has(resolveEquipmentContentId(rulesetId, grant.equipmentSlug))
}
