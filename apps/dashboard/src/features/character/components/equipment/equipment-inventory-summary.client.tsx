'use client'

import { useMemo } from 'react'

import type { CharacterBuildCatalogIndex, CharacterBuilderDraft } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import {
  listEquipmentInventoryRowsFromDraft,
  type EquipmentInventoryQuantityTarget,
  type EquipmentInventoryRemoveTarget,
} from '../../lib/equipment-step.lib'
import { EquipmentInventoryRowItem } from './equipment-inventory-row.client'
import {
  groupEquipmentInventoryRowsForDisplay,
  equipmentInventoryDisplayItemKey,
} from './equipment-inventory-summary.lib'
import {
  equipmentInventorySummaryClasses,
  equipmentInventorySummaryGroupClasses,
  equipmentInventorySummaryListClasses,
} from './equipment-inventory-summary.variants'

export type EquipmentInventorySummaryProps = {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  onRemoveItem?: (target: EquipmentInventoryRemoveTarget) => void
  onSetPurchaseQuantity?: (target: EquipmentInventoryQuantityTarget, quantity: number) => void
}

export function EquipmentInventorySummary({
  draft,
  catalogIndex,
  onRemoveItem,
  onSetPurchaseQuantity,
}: EquipmentInventorySummaryProps) {
  const rows = useMemo(
    () => listEquipmentInventoryRowsFromDraft(draft, catalogIndex),
    [catalogIndex, draft],
  )

  if (rows.length === 0) {
    return <Text variant="muted">No equipment selected yet.</Text>
  }

  const groupedRows = rows.reduce<Map<string, typeof rows>>((groups, row) => {
    const current = groups.get(row.groupLabel) ?? []
    current.push(row)
    groups.set(row.groupLabel, current)
    return groups
  }, new Map())

  return (
    <div className={equipmentInventorySummaryClasses}>
      {[...groupedRows.entries()].map(([groupLabel, groupRows]) => (
        <section key={groupLabel} className={equipmentInventorySummaryGroupClasses}>
          <Heading variant="subsection" as="h3">
            {groupLabel}
          </Heading>
          <ul className={equipmentInventorySummaryListClasses}>
            {groupEquipmentInventoryRowsForDisplay(groupRows).map((display) => (
              <li key={equipmentInventoryDisplayItemKey(display)}>
                <EquipmentInventoryRowItem
                  display={display}
                  onRemoveItem={onRemoveItem}
                  onSetPurchaseQuantity={onSetPurchaseQuantity}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
