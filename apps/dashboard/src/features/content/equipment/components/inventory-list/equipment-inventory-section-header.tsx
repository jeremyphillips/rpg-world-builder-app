import type { ReactNode } from 'react'

import { Badge, Heading } from '@rpg/ui'

import {
  EQUIPMENT_INVENTORY_SECTION_TITLE_VARIANT,
  equipmentInventorySectionHeaderClasses,
} from './equipment-inventory-list.variants'

export type EquipmentInventorySectionHeaderProps = {
  title: ReactNode
  count?: number
  action?: ReactNode
}

/** Presentation-only inventory section chrome — title, optional count badge, optional action. */
export function EquipmentInventorySectionHeader({
  title,
  count,
  action,
}: EquipmentInventorySectionHeaderProps) {
  return (
    <div className={equipmentInventorySectionHeaderClasses}>
      <Heading variant={EQUIPMENT_INVENTORY_SECTION_TITLE_VARIANT} as="h3">
        {title}
      </Heading>
      {count !== undefined && count > 0 ? (
        <Badge appearance="soft" tone="neutral" size="sm">
          {count}
        </Badge>
      ) : null}
      {action}
    </div>
  )
}
