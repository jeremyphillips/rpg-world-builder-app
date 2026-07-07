'use client'

import { useMemo } from 'react'

import type { CharacterBuildCatalogIndex, CharacterEquipment } from '@rpg/contracts'
import { Badge, Heading, Text } from '@rpg/ui'

import { listEquipmentInventoryRows } from '../../lib/equipment-step.lib'
import {
  equipmentInventorySummaryClasses,
  equipmentInventorySummaryGroupClasses,
  equipmentInventorySummaryListClasses,
  equipmentInventorySummaryRowClasses,
  equipmentInventorySummaryRowMetaClasses,
  equipmentInventorySummarySourceClasses,
} from './equipment-inventory-summary.variants'

export type EquipmentInventorySummaryProps = {
  inventory: CharacterEquipment
  catalogIndex: CharacterBuildCatalogIndex
}

export function EquipmentInventorySummary({
  inventory,
  catalogIndex,
}: EquipmentInventorySummaryProps) {
  const rows = useMemo(
    () => listEquipmentInventoryRows(inventory, catalogIndex),
    [catalogIndex, inventory],
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
            {groupRows.map((row) => (
              <li key={`${row.group}-${row.entry.equipmentId}-${row.sourceLabel}`}>
                <div className={equipmentInventorySummaryRowClasses}>
                  <div className={equipmentInventorySummaryRowMetaClasses}>
                    <Text as="span">
                      {row.entry.quantity > 1 ? `${row.entry.quantity}× ` : ''}
                      {row.equipmentName}
                    </Text>
                    {row.entry.equipped ? (
                      <Badge variant="secondary" size="sm">
                        Equipped
                      </Badge>
                    ) : null}
                  </div>
                  <Text variant="small" className={equipmentInventorySummarySourceClasses}>
                    {row.sourceLabel}
                  </Text>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
