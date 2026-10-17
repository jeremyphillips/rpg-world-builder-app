import type { Equipment, EquipmentInstanceSummary } from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

import type { EntitySummaryStatusItem } from '../../../lib/entity/summary/entity-summary-status.types'

import { mergeEquipmentInventoryCatalogReferenceStatus } from './equipment-catalog-reference-status.lib'
import { EQUIPMENT_INSTANCE_EQUIPPED_STATUS_LABEL } from '../instance-summary/equipment-instance-status-labels.lib'
import { mapEquipmentInstanceInventoryStatus } from '../instance-summary/map-equipment-instance-inventory-status'
import { resolveEquipmentNotProficientCompatibilityStatus } from '../instance-summary/resolve-equipment-not-proficient-compatibility-status.lib'

/** Arithmetic segments replaced by calculated adjustment facts. */
const MECHANICAL_METADATA_SEGMENT = /^[+-]\d+ (enhancement|adjustment)$/

export type CreatureEquipmentInventoryEquippedStatusPresentation = 'badge' | 'omit'

/**
 * Status lane for creature loadout inventory rows (monster equipment today; character
 * inventory cards next). Supporting attack/damage copy lives in
 * `resolveEquipmentRowSummary` — not repeated here.
 */
export function resolveCreatureEquipmentInventoryRowStatus(args: {
  summary: EquipmentInstanceSummary
  catalogItem: Equipment | undefined
  catalogMissing: boolean
  isProficient: boolean
  adjustmentSegments?: readonly string[]
  equippedStatusPresentation?: CreatureEquipmentInventoryEquippedStatusPresentation
}): {
  statusComposition: 'metadata'
  status: readonly EntitySummaryStatusItem[]
} {
  const equippedStatusPresentation = args.equippedStatusPresentation ?? 'badge'

  const compatibility = args.catalogItem
    ? resolveEquipmentNotProficientCompatibilityStatus(args.catalogItem, args.isProficient)
    : []
  const { status: instance, statusComposition } = mapEquipmentInstanceInventoryStatus(args.summary)
  const metadataLabel =
    args.summary.metadataSegments.length > 0
      ? joinInlineMetadata(args.summary.metadataSegments)
      : undefined
  const instanceWithoutEquipped = instance.filter((row) => {
    if (
      equippedStatusPresentation === 'omit' &&
      row.kind === 'badge' &&
      'label' in row &&
      row.label === EQUIPMENT_INSTANCE_EQUIPPED_STATUS_LABEL
    ) {
      return false
    }
    return !(row.kind === 'text' && metadataLabel !== undefined && row.label === metadataLabel)
  })
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
