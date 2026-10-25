import type { ReactNode } from 'react'

import { Eyebrow } from '@rpg/ui'

import {
  equipmentInventoryRowListClasses,
  equipmentPurchasedInventoryCategoryClasses,
  equipmentPurchasedInventoryCategoryListClasses,
} from '@/lib/equipment/equipment-inventory-list.variants'

export type EquipmentCategoryGroup<T> = {
  groupLabel: string
  items: readonly T[]
}

export type EquipmentCategoryGroupedListProps<T> = {
  groups: readonly EquipmentCategoryGroup<T>[]
  getItemKey: (item: T) => string
  renderRow: (item: T) => ReactNode
  emptyState?: ReactNode
}

/** Groups inventory rows by kind label; shows eyebrows only when more than one non-empty group. */
export function EquipmentCategoryGroupedList<T>({
  groups,
  getItemKey,
  renderRow,
  emptyState,
}: EquipmentCategoryGroupedListProps<T>) {
  const nonEmpty = groups.filter((group) => group.items.length > 0)
  const hasEntries = nonEmpty.length > 0

  if (!hasEntries) {
    return emptyState ?? null
  }

  const showCategoryHeadings = nonEmpty.length > 1

  const renderList = (items: readonly T[]) => (
    <ul className={equipmentInventoryRowListClasses}>
      {items.map((item) => (
        <li key={getItemKey(item)}>{renderRow(item)}</li>
      ))}
    </ul>
  )

  if (!showCategoryHeadings) {
    const flatItems = nonEmpty.flatMap((group) => group.items)
    return (
      <div className={equipmentPurchasedInventoryCategoryListClasses}>{renderList(flatItems)}</div>
    )
  }

  return (
    <div className={equipmentPurchasedInventoryCategoryListClasses}>
      {nonEmpty.map((group) => (
        <section key={group.groupLabel} className={equipmentPurchasedInventoryCategoryClasses}>
          <Eyebrow size="sm">{group.groupLabel}</Eyebrow>
          {renderList(group.items)}
        </section>
      ))}
    </div>
  )
}
