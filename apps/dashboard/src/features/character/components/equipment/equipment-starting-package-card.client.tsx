'use client'

import { Button, Eyebrow, Text } from '@rpg/ui'

import {
  EQUIPMENT_PACKAGE_CHANGE_OPTION_LABEL,
  EQUIPMENT_PACKAGE_CUSTOMIZE_LABEL,
  EQUIPMENT_PACKAGE_INCLUDED_WEALTH_LABEL,
  type EquipmentInventoryRow,
  type StartingPackageInventoryGroup,
} from '../../lib/equipment-step.lib'
import { EquipmentInventoryRowItem } from './equipment-inventory-row.client'
import {
  equipmentStartingPackageCardActionsClasses,
  equipmentStartingPackageCardBodyClasses,
  equipmentStartingPackageCardClasses,
  equipmentStartingPackageCardHeaderClasses,
  equipmentStartingPackageCardTitleClasses,
  equipmentStartingPackageCategoryClasses,
  equipmentStartingPackageCustomizeReasonClasses,
  equipmentStartingPackageFooterClasses,
  equipmentStartingPackageRowListClasses,
} from './equipment-starting-package.variants'

export type EquipmentStartingPackageCardProps = {
  packageGroup: StartingPackageInventoryGroup
  conversionEditorOpen?: boolean
  customizeControlsId?: string
  onCustomize?: () => void
  onChangeEquipmentOption?: () => void
}

export function EquipmentStartingPackageCard({
  packageGroup,
  conversionEditorOpen = false,
  customizeControlsId,
  onCustomize,
  onChangeEquipmentOption,
}: EquipmentStartingPackageCardProps) {
  const customizeDisabled = packageGroup.customize.status === 'disabled'

  return (
    <section
      className={equipmentStartingPackageCardClasses}
      aria-label={`${packageGroup.optionLabel} starting equipment`}
    >
      <header className={equipmentStartingPackageCardHeaderClasses}>
        <Text as="h4" className={equipmentStartingPackageCardTitleClasses}>
          {packageGroup.optionLabel}
        </Text>
        <div className={equipmentStartingPackageCardActionsClasses}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={customizeDisabled}
            aria-expanded={conversionEditorOpen}
            aria-controls={customizeControlsId}
            onClick={onCustomize}
          >
            {EQUIPMENT_PACKAGE_CUSTOMIZE_LABEL}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onChangeEquipmentOption}>
            {EQUIPMENT_PACKAGE_CHANGE_OPTION_LABEL}
          </Button>
        </div>
      </header>

      {packageGroup.customize.status === 'disabled' ? (
        <div className="px-4 pb-3">
          <Text as="p" className={equipmentStartingPackageCustomizeReasonClasses}>
            {packageGroup.customize.reason}
          </Text>
        </div>
      ) : null}

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
    </section>
  )
}
