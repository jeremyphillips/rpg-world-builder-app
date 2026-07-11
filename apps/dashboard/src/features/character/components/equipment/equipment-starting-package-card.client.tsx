'use client'

import { Badge, Button, Text } from '@rpg/ui'

import { BuilderInventoryRow } from '../builder/builder-inventory-row.client'
import {
  EQUIPMENT_PACKAGE_CHANGE_OPTION_LABEL,
  EQUIPMENT_PACKAGE_CUSTOMIZE_LABEL,
  EQUIPMENT_PACKAGE_INCLUDED_WEALTH_LABEL,
  EQUIPMENT_PACKAGE_REMOVE_FROM_PACKAGE_LABEL,
  formatPackageInventoryRowTitle,
  type EquipmentInventoryRow,
  type StartingPackageInventoryGroup,
} from '../../lib/equipment-step.lib'
import {
  equipmentStartingPackageCardActionsClasses,
  equipmentStartingPackageCardBodyClasses,
  equipmentStartingPackageCardClasses,
  equipmentStartingPackageFooterClasses,
  equipmentStartingPackageCardHeaderClasses,
  equipmentStartingPackageCardTitleClasses,
  equipmentStartingPackageCategoryClasses,
  equipmentStartingPackageCategoryLabelClasses,
  equipmentStartingPackageCustomizeReasonClasses,
  equipmentStartingPackageRowListClasses,
} from './equipment-starting-package.variants'

export type EquipmentStartingPackageCardProps = {
  packageGroup: StartingPackageInventoryGroup
  conversionEditorOpen?: boolean
  customizeControlsId?: string
  onCustomize?: () => void
  onChangeEquipmentOption?: () => void
  onRemoveFromPackage?: (packageItemKey: string) => void
}

function PackageInventoryRow({
  row,
  onRemoveFromPackage,
}: {
  row: EquipmentInventoryRow
  onRemoveFromPackage?: (packageItemKey: string) => void
}) {
  const packageItemKey =
    row.removeTarget?.kind === 'package' ? row.removeTarget.packageItemKey : undefined

  return (
    <BuilderInventoryRow
      variant="dense"
      label={
        <Text as="p" className="font-body text-foreground">
          {formatPackageInventoryRowTitle(row.equipmentName, row.entry.quantity)}
        </Text>
      }
      itemLabel={row.equipmentName}
      meta={
        row.entry.equipped ? (
          <Badge variant="secondary" size="sm">
            Equipped
          </Badge>
        ) : undefined
      }
      provenance={
        row.bundleLabel ? (
          <Text as="p" variant="caption">
            {row.bundleLabel}
          </Text>
        ) : undefined
      }
      footer={
        packageItemKey && onRemoveFromPackage ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto px-0"
            onClick={() => onRemoveFromPackage(packageItemKey)}
          >
            {EQUIPMENT_PACKAGE_REMOVE_FROM_PACKAGE_LABEL}
          </Button>
        ) : undefined
      }
    />
  )
}

export function EquipmentStartingPackageCard({
  packageGroup,
  conversionEditorOpen = false,
  customizeControlsId,
  onCustomize,
  onChangeEquipmentOption,
  onRemoveFromPackage,
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
            <Text as="p" className={equipmentStartingPackageCategoryLabelClasses}>
              {category.groupLabel}
            </Text>
            <ul className={equipmentStartingPackageRowListClasses}>
              {category.rows.map((row) => (
                <li
                  key={
                    row.removeTarget?.kind === 'package'
                      ? row.removeTarget.packageItemKey
                      : row.equipmentName
                  }
                >
                  <PackageInventoryRow row={row} onRemoveFromPackage={onRemoveFromPackage} />
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
