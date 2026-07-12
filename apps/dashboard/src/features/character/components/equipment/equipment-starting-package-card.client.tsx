'use client'

import type { ReactNode } from 'react'

import { Eyebrow } from '@rpg/ui'

import {
  EQUIPMENT_PACKAGE_INCLUDED_WEALTH_LABEL,
  type EquipmentInventoryRow,
  type StartingPackageInventoryGroup,
} from '../../lib/equipment-step.lib'
import { EquipmentInventoryRowItem } from './equipment-inventory-row.client'
import {
  equipmentStartingPackageCardBodyClasses,
  equipmentStartingPackageCardClasses,
  equipmentStartingPackageCategoryClasses,
  equipmentStartingPackageFooterClasses,
  equipmentStartingPackageRowListClasses,
} from './equipment-starting-package.variants'

export type EquipmentStartingPackageCardProps = {
  optionLabel: string
  children: ReactNode
}

export function EquipmentStartingPackageCard({
  optionLabel,
  children,
}: EquipmentStartingPackageCardProps) {
  return (
    <section
      className={equipmentStartingPackageCardClasses}
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
            <ul className={equipmentStartingPackageRowListClasses}>
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
