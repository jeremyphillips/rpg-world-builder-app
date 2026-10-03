import type { ReactNode } from 'react'

import { Text } from '@rpg/ui'

import type { EntitySummaryModel, EntitySummaryStatusItem } from '@/features/content'
import type { EquipmentInventoryRow } from '../../../lib/equipment/equipment-step.lib'
import type { EquipmentInventoryDisplayItem } from '../../../lib/equipment/equipment-inventory-summary.lib'
import { resolveCombinedInventoryDetailLineLabel } from '../../../lib/equipment/equipment-inventory-summary.lib'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

function resolveDetailLineLabel(row: EquipmentInventoryRow): string | undefined {
  if (row.stagedRemoval) return row.sourceLabel
  if (row.priceLineLabel) return row.priceLineLabel
  if (row.bundleLabel) return joinInlineMetadata([row.sourceLabel, row.bundleLabel])
  return row.sourceLabel
}

function resolveInventoryHeading(equipmentName: string, stagedRemoval = false): ReactNode {
  if (!stagedRemoval) return equipmentName

  return (
    <span className="text-muted-foreground line-through" aria-disabled>
      {equipmentName}
    </span>
  )
}

function resolveInventoryDescription(detailLabel?: string): ReactNode | undefined {
  if (!detailLabel) return undefined

  return (
    <Text as="span" variant="caption" className="text-muted-foreground opacity-80">
      {detailLabel}
    </Text>
  )
}

function resolveRowStatus(
  equipped: boolean,
  extraStatus: readonly EntitySummaryStatusItem[] = [],
): EntitySummaryStatusItem[] | undefined {
  const status: EntitySummaryStatusItem[] = equipped
    ? [{ kind: 'badge', label: 'Equipped', appearance: 'soft', tone: 'success' }]
    : []
  status.push(...extraStatus)
  return status.length > 0 ? status : undefined
}

export function buildEquipmentInventoryRowEntity(args: {
  equipmentName: string
  detailLabel?: string
  equipped?: boolean
  stagedRemoval?: boolean
  /** Appended after the Equipped badge (e.g. build advisory warnings). */
  extraStatus?: readonly EntitySummaryStatusItem[]
}): EntitySummaryModel {
  return {
    heading: resolveInventoryHeading(args.equipmentName, args.stagedRemoval),
    description: resolveInventoryDescription(args.detailLabel),
    status: resolveRowStatus(Boolean(args.equipped), args.extraStatus),
  }
}

export function buildEquipmentInventoryDisplayEntity(
  display: EquipmentInventoryDisplayItem,
  detailLabelOverride?: string,
  extraStatus?: readonly EntitySummaryStatusItem[],
): EntitySummaryModel {
  if (display.kind === 'single') {
    const { row } = display
    return buildEquipmentInventoryRowEntity({
      equipmentName: row.equipmentName,
      detailLabel: detailLabelOverride ?? resolveDetailLineLabel(row),
      equipped: Boolean(row.entry.equipped),
      stagedRemoval: row.stagedRemoval,
      extraStatus,
    })
  }

  const equipped = display.rows.some((row) => row.entry.equipped)
  const detailLabel = detailLabelOverride ?? resolveCombinedInventoryDetailLineLabel(display)

  return buildEquipmentInventoryRowEntity({
    equipmentName: display.equipmentName,
    detailLabel,
    equipped,
    extraStatus,
  })
}
