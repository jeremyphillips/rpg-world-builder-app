import { useState } from 'react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuilderDraft,
  ResolvedStartingEquipmentFunding,
  StartingPackageConversionPreview,
} from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'
import { ChevronDown } from 'lucide-react'
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Eyebrow,
  Heading,
  Text,
} from '@rpg/ui'

import { DetailOverflowMenu } from '@/features/content'
import {
  EQUIPMENT_GOLD_OPTION_STARTING_MESSAGE_SHORT,
  EQUIPMENT_PACKAGE_CHANGE_OPTION_MENU_LABEL,
  EQUIPMENT_PACKAGE_CUSTOMIZE_LABEL,
  EQUIPMENT_PACKAGE_CUSTOMIZE_MENU_LABEL,
  EQUIPMENT_PACKAGE_INCLUDED_WEALTH_LABEL,
  EQUIPMENT_STARTING_PACKAGE_TITLE,
  formatEquipmentPackageItemCount,
  type EquipmentInventoryRow,
  type StartingPackageInventoryGroup,
} from '../../../lib/equipment/equipment-step.lib'
import {
  EMPTY_SELECTION_ROW_PRESENTATION,
  resolveSelectionRowStatusItems,
} from '../../../lib/selection-row-status'
import { EquipmentInventoryRowItem } from '../inventory/row/equipment-inventory-row'
import {
  EQUIPMENT_INVENTORY_SECTION_TITLE_VARIANT,
  equipmentInventoryRowListClasses,
} from '../inventory/equipment-inventory.variants'
import { EquipmentPackageConversionEditor } from '../package-switch/equipment-package-conversion-editor'
import {
  equipmentStartingPackageBodyClasses,
  equipmentStartingPackageCategoryClasses,
  equipmentStartingPackageChevronVariants,
  equipmentStartingPackageCustomizeFooterClasses,
  equipmentStartingPackageCustomizeReasonClasses,
  equipmentStartingPackageFooterClasses,
  equipmentStartingPackageHeaderActionsClasses,
  equipmentStartingPackageHeaderClasses,
  equipmentStartingPackageHeaderCopyClasses,
  equipmentStartingPackageSubtitleClasses,
} from './equipment-starting-package.variants'

export type EquipmentStartingPackageDisclosureProps = {
  packageGroup: StartingPackageInventoryGroup
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  goldOptionFunding?: ResolvedStartingEquipmentFunding
  conversionEditorOpen: boolean
  selectedPackageItemKeys: ReadonlySet<string>
  commitStatusMessage?: string
  defaultExpanded?: boolean
  onCustomize: () => void
  onChangeEquipmentOption: () => void
  onSelectedPackageItemKeysChange: (keys: ReadonlySet<string>) => void
  onCancelConversion: () => void
  onCommitConversion: (preview: StartingPackageConversionPreview) => void
}

function packageItemCount(packageGroup: StartingPackageInventoryGroup): number {
  return packageGroup.categoryGroups.reduce((count, category) => count + category.rows.length, 0)
}

export function EquipmentStartingPackageGoldHeader({ optionLabel }: { optionLabel: string }) {
  return (
    <div className={equipmentStartingPackageHeaderClasses}>
      <div className={equipmentStartingPackageHeaderCopyClasses}>
        <Heading variant={EQUIPMENT_INVENTORY_SECTION_TITLE_VARIANT} as="h3">
          {EQUIPMENT_STARTING_PACKAGE_TITLE}
        </Heading>
        <Text as="p" className={equipmentStartingPackageSubtitleClasses}>
          {joinInlineMetadata([EQUIPMENT_GOLD_OPTION_STARTING_MESSAGE_SHORT, optionLabel])}
        </Text>
      </div>
    </div>
  )
}

function EquipmentStartingPackageInventory({
  packageGroup,
}: {
  packageGroup: StartingPackageInventoryGroup
}) {
  return (
    <>
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
                <EquipmentInventoryRowItem
                  display={{ kind: 'single', row }}
                  status={resolveSelectionRowStatusItems(
                    row.selectionPresentation ?? EMPTY_SELECTION_ROW_PRESENTATION,
                    { context: 'review' },
                  )}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}

      {packageGroup.includedWealthLabel ? (
        <footer className={equipmentStartingPackageFooterClasses}>
          {packageGroup.includedWealthLabel} {EQUIPMENT_PACKAGE_INCLUDED_WEALTH_LABEL}
        </footer>
      ) : null}
    </>
  )
}

export function EquipmentStartingPackageDisclosure({
  packageGroup,
  draft,
  catalogIndex,
  goldOptionFunding,
  conversionEditorOpen,
  selectedPackageItemKeys,
  commitStatusMessage,
  defaultExpanded = false,
  onCustomize,
  onChangeEquipmentOption,
  onSelectedPackageItemKeysChange,
  onCancelConversion,
  onCommitConversion,
}: EquipmentStartingPackageDisclosureProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const open = expanded || conversionEditorOpen
  const customizeDisabled = packageGroup.customize.status === 'disabled'
  const subtitle = joinInlineMetadata([
    formatEquipmentPackageItemCount(packageItemCount(packageGroup)),
    packageGroup.optionLabel,
  ])

  const openCustomize = () => {
    setExpanded(true)
    onCustomize()
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => {
        if (!next && conversionEditorOpen) return
        setExpanded(next)
      }}
    >
      <div className={equipmentStartingPackageHeaderClasses}>
        <CollapsibleTrigger asChild>
          <button type="button" className={equipmentStartingPackageHeaderCopyClasses}>
            <Heading variant={EQUIPMENT_INVENTORY_SECTION_TITLE_VARIANT} as="h3">
              {EQUIPMENT_STARTING_PACKAGE_TITLE}
            </Heading>
            <Text as="p" className={equipmentStartingPackageSubtitleClasses}>
              {subtitle}
            </Text>
          </button>
        </CollapsibleTrigger>
        <div className={equipmentStartingPackageHeaderActionsClasses}>
          <DetailOverflowMenu
            triggerLabel={`Actions for ${packageGroup.optionLabel}`}
            actions={[
              {
                id: 'customize-package',
                label: EQUIPMENT_PACKAGE_CUSTOMIZE_MENU_LABEL,
                disabled: customizeDisabled,
                onSelect: openCustomize,
              },
              {
                id: 'change-package-option',
                label: EQUIPMENT_PACKAGE_CHANGE_OPTION_MENU_LABEL,
                onSelect: onChangeEquipmentOption,
              },
            ]}
          />
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              density="compact"
              aria-label={open ? 'Collapse starting package' : 'Expand starting package'}
            >
              <ChevronDown
                aria-hidden
                className={equipmentStartingPackageChevronVariants({ open })}
              />
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className={equipmentStartingPackageBodyClasses}>
        {conversionEditorOpen && goldOptionFunding ? (
          <EquipmentPackageConversionEditor
            draft={draft}
            catalogIndex={catalogIndex}
            departingOptionId={packageGroup.optionId}
            packageGroup={packageGroup}
            targetFunding={goldOptionFunding}
            selectedPackageItemKeys={selectedPackageItemKeys}
            commitStatusMessage={commitStatusMessage}
            onSelectedPackageItemKeysChange={onSelectedPackageItemKeysChange}
            onCancel={onCancelConversion}
            onCommit={onCommitConversion}
          />
        ) : (
          <>
            <EquipmentStartingPackageInventory packageGroup={packageGroup} />
            {packageGroup.customize.status === 'disabled' ? (
              <p className={equipmentStartingPackageCustomizeReasonClasses}>
                {packageGroup.customize.reason}
              </p>
            ) : (
              <div className={equipmentStartingPackageCustomizeFooterClasses}>
                <Button type="button" variant="secondary" size="sm" onClick={openCustomize}>
                  {EQUIPMENT_PACKAGE_CUSTOMIZE_LABEL}
                </Button>
              </div>
            )}
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
