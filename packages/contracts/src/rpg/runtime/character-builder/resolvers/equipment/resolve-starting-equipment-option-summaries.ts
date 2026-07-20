import type { Equipment } from '../../../../content/equipment'
import type { CharacterClass } from '../../../../content/classes/class'
import type { CharacterWealthGrant } from '../../../../content/lib/wealth-grant'
import type { EquipmentPool } from '../../../../content/lib/equipment-grant'
import type { StartingEquipmentOption } from '../../../../content/starting-equipment'
import {
  isProficiencyLinkedStartingEquipmentGrant,
  isWealthOnlyStartingEquipmentOption,
  startingEquipmentGrantEquipmentSlug,
  startingEquipmentGrantProficiencyChoiceId,
} from '../../../../content/starting-equipment'
import { eligibleProficiencyChoiceTargetIds } from '../../../../content/lib/resolve-eligible-proficiency-choice-targets'
import { formatEquipmentPoolLabel } from '../../../../content/lib/equipment-grant'
import {
  isEquipmentPoolFullyAvailable,
  isGrantedEquipmentAvailable,
  toEquipmentContentId,
} from '../../../creature/equipment'
import type { CharacterEquipment } from '../../../character/equipment-inventory'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import {
  characterWealthFromGrant,
  type CharacterWealth,
} from '../../../character/equipment-inventory'
import { equipmentPoolSummaryLabel } from './equipment-pool-choice-options'
import {
  formatStartingEquipmentPackageDescription,
  formatStartingGoldOptionDescription,
} from './format-starting-equipment-option-description'
import { resolveProficiencyLinkedEquipmentGrant } from './resolve-proficiency-linked-equipment-grant'

/** Pre-resolved display inputs for starting-equipment summaries. No campaign policy inside. */
export type StartingEquipmentSummaryContext = {
  resolvedGoldOptionWealthByOptionId: ReadonlyMap<string, CharacterWealth>
}

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

export type StartingEquipmentOptionSummaryProficiencyLinkedGrant = {
  kind: 'proficiency_linked_grant'
  choiceId: string
  choiceLabel: string
  status: 'resolved' | 'pending' | 'invalid'
  resolvedEquipment?: Equipment
  issue?: string
}

export type StartingEquipmentOptionSummaryChoice = {
  kind: 'choice'
  choose: number
  poolLabel: string
  isUnavailable: boolean
}

export type StartingEquipmentOptionSummaryItem =
  | StartingEquipmentOptionSummaryGrant
  | StartingEquipmentOptionSummaryProficiencyLinkedGrant
  | StartingEquipmentOptionSummaryChoice

export type StartingEquipmentOptionSummary = {
  optionId: string
  label: string
  description?: string
  wealth?: CharacterWealthGrant
  orderedItems: readonly StartingEquipmentOptionSummaryItem[]
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
  const equipmentSlug = startingEquipmentGrantEquipmentSlug(grant)
  if (!equipmentSlug) {
    throw new Error('Expected equipment grant target')
  }

  const equipmentId = toEquipmentContentId(rulesetId, equipmentSlug)
  const equipment = catalogIndex.equipment.get(equipmentId)
  const isMissing = !equipment
  const isUnavailable = !isGrantedEquipmentAvailable({
    rulesetId,
    equipmentSlug,
    equipment: catalogIndex.equipment,
  })

  const reasons: string[] = []
  if (isMissing) {
    reasons.push(`${equipmentSlug}: ${STARTING_EQUIPMENT_MISSING_ITEM_MESSAGE}`)
  } else if (isUnavailable) {
    reasons.push(`${equipmentSlug}: ${STARTING_EQUIPMENT_UNAVAILABLE_POOL_MESSAGE}`)
  }

  return {
    summary: {
      kind: 'grant',
      equipmentSlug,
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

function summarizeProficiencyLinkedGrantItem(
  grant: Extract<StartingEquipmentOption['items'][number], { kind: 'grant' }>,
  characterClass: CharacterClass,
  catalogIndex: CharacterBuildCatalogIndex,
  draft?: CharacterBuilderDraft,
): {
  summary: StartingEquipmentOptionSummaryProficiencyLinkedGrant
  group: StartingEquipmentInventoryGroup | undefined
  reasons: string[]
} {
  const choiceId = startingEquipmentGrantProficiencyChoiceId(grant)!
  const choice = (characterClass.characterCreation?.proficiencies?.tools?.choices ?? []).find(
    (entry) => entry.id === choiceId,
  )
  const choiceLabel = choice?.label?.trim() || choiceId

  if (!choice) {
    const issue = `Linked proficiency choice "${choiceId}" is not defined on this class.`
    return {
      summary: {
        kind: 'proficiency_linked_grant',
        choiceId,
        choiceLabel,
        status: 'invalid',
        issue,
      },
      group: undefined,
      reasons: [issue],
    }
  }

  const eligibleIds = eligibleProficiencyChoiceTargetIds(characterClass, catalogIndex)
  if (!eligibleIds.has(choiceId)) {
    const issue = `Linked proficiency choice "${choiceId}" is not eligible for equipment linkage.`
    return {
      summary: {
        kind: 'proficiency_linked_grant',
        choiceId,
        choiceLabel,
        status: 'invalid',
        issue,
      },
      group: undefined,
      reasons: [issue],
    }
  }

  if (draft) {
    const result = resolveProficiencyLinkedEquipmentGrant({
      source: { ownerType: 'class', ownerId: characterClass.id, choiceId },
      draft,
      characterClass,
      catalogIndex,
    })

    if (result.status === 'resolved') {
      return {
        summary: {
          kind: 'proficiency_linked_grant',
          choiceId,
          choiceLabel,
          status: 'resolved',
          resolvedEquipment: result.equipment,
        },
        group: result.equipment ? inventoryGroupForEquipment(result.equipment) : 'tools',
        reasons: [],
      }
    }

    if (result.status === 'invalid') {
      return {
        summary: {
          kind: 'proficiency_linked_grant',
          choiceId,
          choiceLabel,
          status: 'invalid',
          issue: result.issue,
        },
        group: undefined,
        reasons: [result.issue],
      }
    }
  }

  return {
    summary: {
      kind: 'proficiency_linked_grant',
      choiceId,
      choiceLabel,
      status: 'pending',
    },
    group: 'tools',
    reasons: [],
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
  draft?: CharacterBuilderDraft,
  context?: StartingEquipmentSummaryContext,
): StartingEquipmentOptionSummary {
  const rulesetId = characterClass.rulesetId
  const itemsByGroup = EMPTY_ITEMS_BY_GROUP()
  const orderedItems: StartingEquipmentOptionSummaryItem[] = []
  const missingItemSlugs: string[] = []
  const unselectableReasons: string[] = []

  for (const item of option.items) {
    if (item.kind === 'grant') {
      if (isProficiencyLinkedStartingEquipmentGrant(item)) {
        const { summary, group, reasons } = summarizeProficiencyLinkedGrantItem(
          item,
          characterClass,
          catalogIndex,
          draft,
        )
        orderedItems.push(summary)
        unselectableReasons.push(...reasons)
        if (group) itemsByGroup[group].push(summary)
        continue
      }

      const { summary, group, reasons } = summarizeGrantItem(item, rulesetId, catalogIndex)
      orderedItems.push(summary)
      if (summary.isMissing) {
        const equipmentSlug = startingEquipmentGrantEquipmentSlug(item)
        if (equipmentSlug) missingItemSlugs.push(equipmentSlug)
      }
      unselectableReasons.push(...reasons)
      if (group) itemsByGroup[group].push(summary)
      continue
    }

    const { summary, reasons } = summarizeChoiceItem(item, rulesetId, catalogIndex)
    orderedItems.push(summary)
    unselectableReasons.push(...reasons)
    itemsByGroup[inventoryGroupForChoice(item.pool)].push(summary)
  }

  const description = isWealthOnlyStartingEquipmentOption(option)
    ? formatStartingGoldOptionDescription({
        wealth:
          context?.resolvedGoldOptionWealthByOptionId.get(option.id) ??
          characterWealthFromGrant(option.wealth!),
      })
    : formatStartingEquipmentPackageDescription({
        orderedItems,
        wealth: option.wealth,
      })

  return {
    optionId: option.id,
    label: option.label,
    description,
    wealth: option.wealth,
    orderedItems,
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
  draft?: CharacterBuilderDraft,
  context?: StartingEquipmentSummaryContext,
): StartingEquipmentOptionSummary[] {
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return []

  return startingEquipment.options.map((option) =>
    summarizeOption(characterClass, option, catalogIndex, draft, context),
  )
}
