'use client'

import type { ReactNode } from 'react'

import { Eyebrow } from '@rpg/ui'

import {
  EQUIPMENT_PACKAGE_INCLUDED_WEALTH_LABEL,
  type EquipmentInventoryRow,
  type StartingPackageInventoryGroup,
} from '../../../lib/equipment/equipment-step.lib'
import { EquipmentInventoryRowItem } from '../inventory/row/equipment-inventory-row.client'
import { equipmentInventoryRowListClasses } from '../inventory/equipment-inventory.variants'
import {
  equipmentStartingPackageCardBodyClasses,
  equipmentStartingPackageCardVariants,
  type EquipmentStartingPackageCardSurface,
  equipmentStartingPackageCategoryClasses,
  equipmentStartingPackageFooterClasses,
} from './equipment-starting-package.variants'

export type EquipmentStartingPackageCardProps = {
  optionLabel: string
  surface?: EquipmentStartingPackageCardSurface
  children: ReactNode
}

export function EquipmentStartingPackageCard({
  optionLabel,
  surface = 'subtle',
  children,
}: EquipmentStartingPackageCardProps) {
  return (
    <section
      className={equipmentStartingPackageCardVariants({ surface })}
      aria-label={`${optionLabel} starting equipment`}
    >
      {children}
    </section>
  )
}

export type EquipmentStartingPackageInventoryProps = {
  packageGroup: StartingPackageInventoryGroup
}

export function EquipmentStartingPackageInventory({
  packageGroup,
}: EquipmentStartingPackageInventoryProps) {
  return (
    <>
      <div className={equipmentStartingPackageCardBodyClasses}>
        {packageGroup.categoryGroups.map((category) => (
          <div key={category.groupLabel} className={equipmentStartingPackageCategoryClasses}>
            <Eyebrow size="sm">{category.groupLabel}</Eyebrow>
            <ul className={equipmentInventoryRowListClasses}>
              {category.rows.map((row: EquipmentInventoryRow) => (
                <li
                  key={
                    row.removeTarget?.kind === 'package'
                      ? row.removeTarget.packageItemKey
                      : row.equipmentName
                  }
                >
                  <EquipmentInventoryRowItem display={{ kind: 'single', row }} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {packageGroup.includedWealthLabel ? (
        <footer className={equipmentStartingPackageFooterClasses}>
          {packageGroup.includedWealthLabel} {EQUIPMENT_PACKAGE_INCLUDED_WEALTH_LABEL}
        </footer>
      ) : null}
    </>
  )
}
