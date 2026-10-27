import type { ReactNode } from 'react'

import { Badge, Heading } from '@rpg/ui'

import { EQUIPMENT_INVENTORY_SECTION_TITLE_VARIANT } from '@/lib/equipment/equipment-inventory-list.variants'

export type EquipmentInventorySectionHeaderProps = {
  title: string
  count?: number
  action?: ReactNode
}

const equipmentInventorySectionHeaderLabelRowClasses = 'flex min-w-0 items-center gap-2'

const equipmentInventorySectionHeaderActionLayoutClasses =
  'grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-4 items-center'

const equipmentInventorySectionHeaderActionSlotClasses =
  'flex shrink-0 items-center justify-self-end'

/** Presentation-only inventory section chrome — title, optional count badge, optional action. */
export function EquipmentInventorySectionHeader({
  title,
  count,
  action,
}: EquipmentInventorySectionHeaderProps) {
  const countBadge =
    count !== undefined && count > 0 ? (
      <Badge appearance="soft" tone="neutral" size="sm">
        {count}
      </Badge>
    ) : undefined

  const titleBlock = (
    <div className={equipmentInventorySectionHeaderLabelRowClasses}>
      <Heading variant={EQUIPMENT_INVENTORY_SECTION_TITLE_VARIANT} as="h3" className="min-w-0">
        {title}
      </Heading>
      {countBadge}
    </div>
  )

  if (!action) {
    return titleBlock
  }

  return (
    <div className={equipmentInventorySectionHeaderActionLayoutClasses}>
      {titleBlock}
      <div className={equipmentInventorySectionHeaderActionSlotClasses}>{action}</div>
    </div>
  )
}
