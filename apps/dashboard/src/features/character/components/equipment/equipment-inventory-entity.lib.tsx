import type { ReactNode } from 'react'

import { Text } from '@rpg/ui'

import type { EntitySummaryModel } from '@/features/content'
import type { EquipmentInventoryRow } from '../../lib/equipment/equipment-step.lib'
import type { EquipmentInventoryDisplayItem } from './equipment-inventory-summary.lib'
import { resolveCombinedInventoryDetailLineLabel } from './equipment-inventory-summary.lib'

function resolveDetailLineLabel(row: EquipmentInventoryRow): string | undefined {
  if (row.stagedRemoval) return row.sourceLabel
  if (row.priceLineLabel) return row.priceLineLabel
  if (row.bundleLabel) return `${row.sourceLabel} · ${row.bundleLabel}`
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

function resolveEquippedStatus(equipped: boolean) {
  if (!equipped) return undefined

  return [
    {
      kind: 'badge' as const,
      label: 'Equipped',
      appearance: 'soft' as const,
      tone: 'success' as const,
    },
  ]
}

export function buildEquipmentInventoryRowEntity(args: {
  equipmentName: string
  detailLabel?: string
  equipped?: boolean
  stagedRemoval?: boolean
}): EntitySummaryModel {
  return {
    heading: resolveInventoryHeading(args.equipmentName, args.stagedRemoval),
    description: resolveInventoryDescription(args.detailLabel),
    status: resolveEquippedStatus(Boolean(args.equipped)),
  }
}

export function buildEquipmentInventoryDisplayEntity(
  display: EquipmentInventoryDisplayItem,
  detailLabelOverride?: string,
): EntitySummaryModel {
  if (display.kind === 'single') {
    const { row } = display
    return buildEquipmentInventoryRowEntity({
      equipmentName: row.equipmentName,
      detailLabel: detailLabelOverride ?? resolveDetailLineLabel(row),
      equipped: Boolean(row.entry.equipped),
      stagedRemoval: row.stagedRemoval,
    })
  }

  const equipped = display.rows.some((row) => row.entry.equipped)
  const detailLabel = detailLabelOverride ?? resolveCombinedInventoryDetailLineLabel(display)

  return buildEquipmentInventoryRowEntity({
    equipmentName: display.equipmentName,
    detailLabel,
    equipped,
  })
}
