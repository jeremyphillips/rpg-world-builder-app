'use client'

import type { ReactNode } from 'react'

import { Heading } from '@rpg/ui'

import {
  EQUIPMENT_INVENTORY_COLUMN_TITLE_VARIANT,
  equipmentInventoryColumnClasses,
  equipmentInventoryColumnHeaderClasses,
  equipmentInventoryColumnTitleRowClasses,
  equipmentInventoryColumnToolbarSpacerClasses,
} from './equipment-inventory-summary.variants'

export type EquipmentInventoryColumnProps = {
  title: string
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
  titleActions,
  toolbar,
  reserveToolbarRow = false,
  children,
}: EquipmentInventoryColumnProps) {
  return (
    <section className={equipmentInventoryColumnClasses}>
      <div className={equipmentInventoryColumnHeaderClasses}>
        <div className={equipmentInventoryColumnTitleRowClasses}>
          <Heading variant={EQUIPMENT_INVENTORY_COLUMN_TITLE_VARIANT} as="h3">
            {title}
          </Heading>
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
