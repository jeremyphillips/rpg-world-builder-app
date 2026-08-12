'use client'

import type { ReactNode } from 'react'

import { Badge, Heading } from '@rpg/ui'

import {
  EQUIPMENT_INVENTORY_COLUMN_TITLE_VARIANT,
  equipmentInventoryColumnClasses,
  equipmentInventoryColumnHeaderClasses,
  equipmentInventoryColumnTitleRowClasses,
  equipmentInventoryColumnToolbarSpacerClasses,
} from './equipment-inventory-summary.variants'

export type EquipmentInventoryColumnProps = {
  title: string
  /** Count badge rendered adjacent to the heading when greater than zero. */
  titleBadgeCount?: number
  /** Inline actions on the title row (e.g. Browse equipment). */
  titleActions?: ReactNode
  /** Secondary row below the title (e.g. Customize · Change option links). */
  toolbar?: ReactNode
  /** Keeps grid alignment when the sibling column renders a toolbar row. */
  reserveToolbarRow?: boolean
  children: ReactNode
}

/** Shared inventory column chrome — title, optional actions, and scrollable body. */
export function EquipmentInventoryColumn({
  title,
  titleBadgeCount,
  titleActions,
  toolbar,
  reserveToolbarRow = false,
  children,
}: EquipmentInventoryColumnProps) {
  return (
    <section className={equipmentInventoryColumnClasses}>
      <div className={equipmentInventoryColumnHeaderClasses}>
        <div className={equipmentInventoryColumnTitleRowClasses}>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Heading variant={EQUIPMENT_INVENTORY_COLUMN_TITLE_VARIANT} as="h3">
              {title}
            </Heading>
            {titleBadgeCount !== undefined && titleBadgeCount > 0 ? (
              <Badge appearance="soft" tone="neutral" size="sm">
                {titleBadgeCount}
              </Badge>
            ) : null}
          </div>
          {titleActions}
        </div>
        {toolbar}
        {reserveToolbarRow && !toolbar ? (
          <div className={equipmentInventoryColumnToolbarSpacerClasses} aria-hidden />
        ) : null}
      </div>
      {children}
    </section>
  )
}
