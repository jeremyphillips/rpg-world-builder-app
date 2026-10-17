import type { Equipment, EquipmentInstanceSummary } from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

import { EQUIPMENT_INSTANCE_EQUIPPED_STATUS_LABEL } from '../../../equipment/lib/instance-summary/equipment-instance-status-labels.lib'
import { mergeEquipmentInventoryCatalogReferenceStatus } from '../../../equipment/lib/inventory/equipment-catalog-reference-status.lib'
import { mapEquipmentInstanceInventoryStatus } from '../../../equipment/lib/instance-summary/map-equipment-instance-inventory-status'
import { resolveEquipmentNotProficientCompatibilityStatus } from '../../../equipment/lib/instance-summary/resolve-equipment-not-proficient-compatibility-status.lib'
import type { EntitySummaryStatusItem } from '../../../lib/entity/summary/entity-summary-status.types'

/** Arithmetic segments replaced by calculated adjustment facts. */
const MECHANICAL_METADATA_SEGMENT = /^[+-]\d+ (enhancement|adjustment)$/

/**
 * Metadata status order for monster equipment rows:
 * 1. Compatibility (Not proficient)
 * 2. Instance lane from mapEquipmentInstanceInventoryStatus (Magical, integrity)
 * 3. Non-arithmetic property names, then calculated adjustment sources
 *
 * Equipped state is shown via the inline equip toggle — not a success badge.
 * Enhancement and adjustment totals already in the row summary are not repeated
 * from the instance metadata blob.
 */
export function resolveMonsterEquipmentRowStatus(args: {
  summary: EquipmentInstanceSummary
  catalogItem: Equipment | undefined
  catalogMissing: boolean
  isProficient: boolean
  adjustmentSegments?: readonly string[]
}): {
  statusComposition: 'metadata'
  status: readonly EntitySummaryStatusItem[]
} {
  const compatibility = args.catalogItem
    ? resolveEquipmentNotProficientCompatibilityStatus(args.catalogItem, args.isProficient)
    : []
  const { status: instance, statusComposition } = mapEquipmentInstanceInventoryStatus(args.summary)
  const metadataLabel =
    args.summary.metadataSegments.length > 0
      ? joinInlineMetadata(args.summary.metadataSegments)
      : undefined
  const instanceWithoutEquipped = instance.filter(
    (row) =>
      !(
        row.kind === 'badge' &&
        'label' in row &&
        row.label === EQUIPMENT_INSTANCE_EQUIPPED_STATUS_LABEL
      ) && !(row.kind === 'text' && metadataLabel !== undefined && row.label === metadataLabel),
  )
  const detailSegments = [
    ...args.summary.metadataSegments.filter(
      (segment) => !MECHANICAL_METADATA_SEGMENT.test(segment),
    ),
    ...(args.adjustmentSegments ?? []),
  ]
  const withDetails =
    detailSegments.length > 0
      ? [
          ...instanceWithoutEquipped,
          {
            kind: 'text' as const,
            label: joinInlineMetadata(detailSegments),
            variant: 'muted' as const,
          },
        ]
      : instanceWithoutEquipped
  const status = mergeEquipmentInventoryCatalogReferenceStatus(
    [...compatibility, ...withDetails],
    args.catalogMissing,
  )
  return { statusComposition, status }
}
