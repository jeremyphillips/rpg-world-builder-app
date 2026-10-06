import type { ReactNode } from 'react'

import type { EntitySummaryModel, EntitySummaryStatusItem } from '@/features/content'
import type { EquipmentInventoryRow } from '../../../lib/equipment/equipment-step.lib'
import type { EquipmentInventoryDisplayItem } from '../../../lib/equipment/equipment-inventory-summary.lib'
import { resolveCombinedInventoryDetailLineLabel } from '../../../lib/equipment/equipment-inventory-summary.lib'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

function nonemptyLabel(label?: string): string | undefined {
  if (!label) return undefined
  return label
}

function resolveDetailLineLabel(row: EquipmentInventoryRow): string | undefined {
  if (row.stagedRemoval) return nonemptyLabel(row.sourceLabel)
  if (row.priceLineLabel) return nonemptyLabel(row.priceLineLabel)
  if (row.bundleLabel) return nonemptyLabel(joinInlineMetadata([row.sourceLabel, row.bundleLabel]))
  return nonemptyLabel(row.sourceLabel)
}

function resolveInventoryHeading(equipmentName: string, stagedRemoval = false): ReactNode {
  if (!stagedRemoval) return equipmentName

  return (
    <span className="text-muted-foreground line-through" aria-disabled>
      {equipmentName}
    </span>
  )
}

/** Provenance or price copy for the trailing cell (`meta` or `indicator: label`). */
export function resolveInventoryRowTrailingMeta(
  display: EquipmentInventoryDisplayItem,
  override?: string,
): string | undefined {
  const overrideLabel = nonemptyLabel(override)
  if (overrideLabel) return overrideLabel
  if (display.kind === 'single') return resolveDetailLineLabel(display.row)
  return nonemptyLabel(resolveCombinedInventoryDetailLineLabel(display))
}

export function buildEquipmentInventoryRowEntity(args: {
  equipmentName: string
  stagedRemoval?: boolean
  /** Advisory warnings and other status lines under the name. */
  extraStatus?: readonly EntitySummaryStatusItem[]
}): EntitySummaryModel {
  return {
    heading: resolveInventoryHeading(args.equipmentName, args.stagedRemoval),
    status: args.extraStatus && args.extraStatus.length > 0 ? [...args.extraStatus] : undefined,
  }
}

export function buildEquipmentInventoryDisplayEntity(
  display: EquipmentInventoryDisplayItem,
  extraStatus?: readonly EntitySummaryStatusItem[],
): EntitySummaryModel {
  if (display.kind === 'single') {
    const { row } = display
    return buildEquipmentInventoryRowEntity({
      equipmentName: row.equipmentName,
      stagedRemoval: row.stagedRemoval,
      extraStatus,
    })
  }

  return buildEquipmentInventoryRowEntity({
    equipmentName: display.equipmentName,
    extraStatus,
  })
}
