import type { Equipment } from '../../../../content/equipment'
import type { CharacterClass } from '../../../../content/classes/class'
import type { CharacterWealthGrant } from '../../../../content/lib/wealth-grant'
import type { EquipmentPool } from '../../../../content/lib/equipment-grant'
import type { StartingEquipmentOption } from '../../../../content/starting-equipment'
import { formatEquipmentPoolLabel } from '../../../../content/lib/equipment-grant'
import {
  isEquipmentPoolFullyAvailable,
  isGrantedEquipmentAvailable,
  toEquipmentContentId,
} from '../../../creature/equipment'
import type { CharacterEquipment } from '../../../character/equipment-inventory'
import type { CharacterBuildCatalogIndex } from '../../context'
import { equipmentPoolSummaryLabel } from './equipment-pool-choice-options'

export const STARTING_EQUIPMENT_MISSING_ITEM_MESSAGE = 'Missing from catalog'
export const STARTING_EQUIPMENT_UNAVAILABLE_POOL_MESSAGE = 'No matching items in catalog'

export type StartingEquipmentInventoryGroup = keyof CharacterEquipment

export type StartingEquipmentOptionSummaryGrant = {
  kind: 'grant'
  equipmentSlug: string
  equipmentId: string
  quantity: number
  equipped?: boolean
  equipment?: Equipment
  isMissing: boolean
  isUnavailable: boolean
}

export type StartingEquipmentOptionSummaryChoice = {
  kind: 'choice'
  choose: number
  poolLabel: string
  isUnavailable: boolean
}

export type StartingEquipmentOptionSummaryItem =
  | StartingEquipmentOptionSummaryGrant
  | StartingEquipmentOptionSummaryChoice

export type StartingEquipmentOptionSummary = {
  optionId: string
  label: string
  description?: string
  wealth?: CharacterWealthGrant
  itemsByGroup: Record<StartingEquipmentInventoryGroup, StartingEquipmentOptionSummaryItem[]>
  missingItemSlugs: string[]
  unselectableReasons: readonly string[]
  isSelectable: boolean
}

const EMPTY_ITEMS_BY_GROUP = (): Record<
  StartingEquipmentInventoryGroup,
  StartingEquipmentOptionSummaryItem[]
> => ({
  weapons: [],
  armor: [],
  tools: [],
  gear: [],
  magicItems: [],
  vehicles: [],
  mounts: [],
})

const EQUIPMENT_KIND_TO_INVENTORY_GROUP = {
  weapon: 'weapons',
  armor: 'armor',
  tool: 'tools',
  adventuring_gear: 'gear',
  magic_item: 'magicItems',
  vehicle: 'vehicles',
  mount: 'mounts',
  service: 'gear',
} as const satisfies Record<Equipment['kind'], StartingEquipmentInventoryGroup>

function inventoryGroupForEquipment(equipment: Equipment): StartingEquipmentInventoryGroup {
  return EQUIPMENT_KIND_TO_INVENTORY_GROUP[equipment.kind]
}

function summarizeGrantItem(
  grant: Extract<StartingEquipmentOption['items'][number], { kind: 'grant' }>,
  rulesetId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): {
  summary: StartingEquipmentOptionSummaryGrant
  group: StartingEquipmentInventoryGroup | undefined
  reasons: string[]
} {
  const equipmentId = toEquipmentContentId(rulesetId, grant.equipmentSlug)
  const equipment = catalogIndex.equipment.get(equipmentId)
  const isMissing = !equipment
  const isUnavailable = !isGrantedEquipmentAvailable({
    rulesetId,
    equipmentSlug: grant.equipmentSlug,
    equipment: catalogIndex.equipment,
  })

  const reasons: string[] = []
  if (isMissing) {
    reasons.push(`${grant.equipmentSlug}: ${STARTING_EQUIPMENT_MISSING_ITEM_MESSAGE}`)
  } else if (isUnavailable) {
    reasons.push(`${grant.equipmentSlug}: ${STARTING_EQUIPMENT_UNAVAILABLE_POOL_MESSAGE}`)
  }

  return {
    summary: {
      kind: 'grant',
      equipmentSlug: grant.equipmentSlug,
      equipmentId,
      quantity: grant.quantity ?? 1,
      equipped: grant.equipped,
      equipment,
      isMissing,
      isUnavailable,
    },
    group: equipment ? inventoryGroupForEquipment(equipment) : undefined,
    reasons,
  }
}

function summarizeChoiceItem(
  choice: Extract<StartingEquipmentOption['items'][number], { kind: 'choice' }>,
  rulesetId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): { summary: StartingEquipmentOptionSummaryChoice; reasons: string[] } {
  const isUnavailable = !isEquipmentPoolFullyAvailable({
    pool: choice.pool,
    equipment: catalogIndex.equipment,
    rulesetId,
  })

  const reasons = isUnavailable
    ? [`${equipmentPoolSummaryLabel(choice.pool)}: ${STARTING_EQUIPMENT_UNAVAILABLE_POOL_MESSAGE}`]
    : []

  return {
    summary: {
      kind: 'choice',
      choose: choice.choose ?? 1,
      poolLabel: formatEquipmentPoolLabel(choice.pool),
      isUnavailable,
    },
    reasons,
  }
}

function inventoryGroupForChoice(pool: EquipmentPool): StartingEquipmentInventoryGroup {
  if (pool.source === 'filtered') {
    return EQUIPMENT_KIND_TO_INVENTORY_GROUP[pool.equipmentKind]
  }
  return 'gear'
}

function summarizeOption(
  characterClass: CharacterClass,
  option: StartingEquipmentOption,
  catalogIndex: CharacterBuildCatalogIndex,
): StartingEquipmentOptionSummary {
  const rulesetId = characterClass.rulesetId
  const itemsByGroup = EMPTY_ITEMS_BY_GROUP()
  const missingItemSlugs: string[] = []
  const unselectableReasons: string[] = []

  for (const item of option.items) {
    if (item.kind === 'grant') {
      const { summary, group, reasons } = summarizeGrantItem(item, rulesetId, catalogIndex)
      if (summary.isMissing) missingItemSlugs.push(item.equipmentSlug)
      unselectableReasons.push(...reasons)
      if (group) itemsByGroup[group].push(summary)
      continue
    }

    const { summary, reasons } = summarizeChoiceItem(item, rulesetId, catalogIndex)
    unselectableReasons.push(...reasons)
    itemsByGroup[inventoryGroupForChoice(item.pool)].push(summary)
  }

  return {
    optionId: option.id,
    label: option.label,
    description: option.description,
    wealth: option.wealth,
    itemsByGroup,
    missingItemSlugs,
    unselectableReasons,
    isSelectable: unselectableReasons.length === 0,
  }
}

/** Enriches each starting-equipment package option for option-card UI (BENCH-097). */
export function resolveStartingEquipmentOptionSummaries(
  characterClass: CharacterClass,
  catalogIndex: CharacterBuildCatalogIndex,
): StartingEquipmentOptionSummary[] {
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return []

  return startingEquipment.options.map((option) =>
    summarizeOption(characterClass, option, catalogIndex),
  )
}
