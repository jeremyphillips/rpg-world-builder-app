'use client'

import * as React from 'react'

import { Badge, Button, CatalogPickerSheet, NumberInput, PreviewCard, Text, cn } from '@rpg/ui'
import { getEquipmentKindLabel, isEquipmentStackable, type EquipmentKind } from '@rpg/contracts'

import {
  filterEquipmentPickerItems,
  formatEquipmentPickerDetails,
  formatEquipmentPickerSummaryLine,
  getEquipmentPickerBadgeLabel,
  getEquipmentPickerDisabledNote,
  getEquipmentPickerItemTab,
  isEquipmentPickerItemDisabled,
  resolveEquipmentKindFilterOptions,
} from './equipment-picker-drawer.lib'
import { formatEquipmentPickerItemDetails } from './equipment-picker-character-preview.lib'
import {
  EQUIPMENT_PICKER_ADD_QUANTITY_LABEL,
  EQUIPMENT_PICKER_IN_INVENTORY_LABEL,
  EQUIPMENT_PICKER_TAB_ALL,
  EQUIPMENT_PICKER_TAB_RECOMMENDED,
  type EquipmentPickerDrawerProps,
  type EquipmentPickerItem,
} from './equipment-picker-drawer.types'
import { EquipmentBudgetHeader } from './equipment-budget-header.client'
import {
  equipmentPickerDisabledRowClasses,
  equipmentPickerKindChipActiveClasses,
  equipmentPickerKindChipInactiveClasses,
  equipmentPickerKindFiltersClasses,
  equipmentPickerQuantityControlsClasses,
  equipmentPickerWarningBadgeClasses,
} from './equipment-picker-drawer.variants'

export type { EquipmentPickerDrawerProps } from './equipment-picker-drawer.types'

function EquipmentKindFilters({
  kinds,
  selectedKinds,
  onToggleKind,
}: {
  kinds: EquipmentKind[]
  selectedKinds: readonly EquipmentKind[]
  onToggleKind: (kind: EquipmentKind) => void
}) {
  if (kinds.length <= 1) return null

  return (
    <div className={equipmentPickerKindFiltersClasses} role="group" aria-label="Filter by kind">
      {kinds.map((kind) => {
        const active = selectedKinds.includes(kind)
        return (
          <button
            key={kind}
            type="button"
            aria-pressed={active}
            className={
              active ? equipmentPickerKindChipActiveClasses : equipmentPickerKindChipInactiveClasses
            }
            onClick={() => onToggleKind(kind)}
          >
            {getEquipmentKindLabel(kind)}
          </button>
        )
      })}
    </div>
  )
}

function EquipmentPickerRow({
  item,
  budget,
  ownedQuantity,
  uniqueOwned,
  addQuantity,
  onAddQuantityChange,
  onAdd,
}: {
  item: EquipmentPickerItem
  budget?: EquipmentPickerDrawerProps['budget']
  ownedQuantity: number
  uniqueOwned: boolean
  addQuantity: number
  onAddQuantityChange: (quantity: number) => void
  onAdd: () => void
}) {
  const disabled = isEquipmentPickerItemDisabled(item)
  const badgeLabel = getEquipmentPickerBadgeLabel(item)
  const disabledNote = getEquipmentPickerDisabledNote(item, budget)
  const stackable = isEquipmentStackable(item.equipment)
  const uniqueBlocked = !stackable && (uniqueOwned || ownedQuantity > 0)

  return (
    <div className={cn(disabled ? equipmentPickerDisabledRowClasses : undefined)}>
      <PreviewCard
        title={item.equipment.name}
        description={formatEquipmentPickerSummaryLine(item.equipment)}
        tone="transparent"
        density="compact"
        footerSlot={disabledNote ? <Text variant="muted">{disabledNote}</Text> : undefined}
        endSlot={
          <div className="flex flex-col items-end gap-2">
            {badgeLabel ? (
              <Badge variant="outline" className={equipmentPickerWarningBadgeClasses}>
                {badgeLabel}
              </Badge>
            ) : null}
            {stackable ? (
              <div className={equipmentPickerQuantityControlsClasses}>
                <NumberInput
                  aria-label={`${EQUIPMENT_PICKER_ADD_QUANTITY_LABEL} for ${item.equipment.name}`}
                  size="sm"
                  digits={2}
                  min={1}
                  value={addQuantity}
                  disabled={disabled}
                  onChange={(event) => {
                    const next = Number(event.target.value)
                    onAddQuantityChange(Number.isFinite(next) && next >= 1 ? next : 1)
                  }}
                />
                <Button type="button" size="sm" disabled={disabled} onClick={onAdd}>
                  {ownedQuantity > 0 ? `Add (${ownedQuantity + addQuantity})` : 'Add'}
                </Button>
              </div>
            ) : (
              <Button type="button" size="sm" disabled={disabled || uniqueBlocked} onClick={onAdd}>
                {uniqueBlocked ? EQUIPMENT_PICKER_IN_INVENTORY_LABEL : 'Add'}
              </Button>
            )}
          </div>
        }
      />
    </div>
  )
}

/** Equipment catalog drawer — thin wrapper over `CatalogPickerSheet`. */
export function EquipmentPickerDrawer({
  open,
  onOpenChange,
  items,
  budget,
  defaultTab = EQUIPMENT_PICKER_TAB_RECOMMENDED,
  allowedKinds,
  filterOutUnaffordable = true,
  filterOutNonProficient = false,
  showCharacterPreview = false,
  characterPreviewContext,
  ownedPurchaseQuantities = {},
  isUniqueEquipmentOwned,
  onAddItem,
}: EquipmentPickerDrawerProps) {
  const kindOptions = React.useMemo(
    () => resolveEquipmentKindFilterOptions(items, allowedKinds),
    [allowedKinds, items],
  )
  const [selectedKinds, setSelectedKinds] = React.useState(kindOptions)
  const [addQuantities, setAddQuantities] = React.useState<Record<string, number>>({})

  React.useEffect(() => {
    if (!open) {
      setAddQuantities({})
      setSelectedKinds(kindOptions)
    }
  }, [kindOptions, open])

  React.useEffect(() => {
    setSelectedKinds((current) => {
      const next = current.filter((kind) => kindOptions.includes(kind))
      return next.length > 0 ? next : kindOptions
    })
  }, [kindOptions])

  const visibleItems = React.useMemo(
    () =>
      filterEquipmentPickerItems(items, {
        filterOutUnaffordable,
        filterOutNonProficient,
        selectedKinds,
      }),
    [filterOutNonProficient, filterOutUnaffordable, items, selectedKinds],
  )

  const handleToggleKind = React.useCallback(
    (kind: EquipmentKind) => {
      setSelectedKinds((current) => {
        if (current.includes(kind)) {
          const next = current.filter((entry) => entry !== kind)
          return next.length > 0 ? next : kindOptions
        }
        return [...current, kind]
      })
    },
    [kindOptions],
  )

  const handleAddItem = React.useCallback(
    (item: EquipmentPickerItem) => {
      const itemKey = item.equipment.id
      const quantity = addQuantities[itemKey] ?? 1
      onAddItem(item, quantity)
      if (isEquipmentStackable(item.equipment)) {
        setAddQuantities((current) => ({ ...current, [itemKey]: 1 }))
      }
    },
    [addQuantities, onAddItem],
  )

  const handleAddQuantityChange = React.useCallback((itemKey: string, quantity: number) => {
    setAddQuantities((current) => ({ ...current, [itemKey]: quantity }))
  }, [])

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add equipment"
      description="Search the catalog and add items to your loadout."
      items={visibleItems}
      getItemKey={(item) => item.equipment.id}
      getSearchText={(item) => item.searchText}
      getItemTab={getEquipmentPickerItemTab}
      defaultTabId={defaultTab}
      tabs={[
        { id: EQUIPMENT_PICKER_TAB_RECOMMENDED, label: 'Recommended' },
        { id: EQUIPMENT_PICKER_TAB_ALL, label: 'All' },
      ]}
      headerExtra={budget ? <EquipmentBudgetHeader budget={budget} /> : undefined}
      filters={
        <EquipmentKindFilters
          kinds={kindOptions}
          selectedKinds={selectedKinds}
          onToggleKind={handleToggleKind}
        />
      }
      renderItem={(item) => (
        <EquipmentPickerRow
          item={item}
          budget={budget}
          ownedQuantity={ownedPurchaseQuantities[item.equipment.id] ?? 0}
          uniqueOwned={isUniqueEquipmentOwned?.(item.equipment.id) ?? false}
          addQuantity={addQuantities[item.equipment.id] ?? 1}
          onAddQuantityChange={(quantity) => handleAddQuantityChange(item.equipment.id, quantity)}
          onAdd={() => handleAddItem(item)}
        />
      )}
      renderItemDetails={(item) => (
        <Text as="p" variant="muted" className="whitespace-pre-line">
          {formatEquipmentPickerItemDetails(
            item.equipment,
            {
              showCharacterPreview,
              characterPreviewContext,
              isProficient: item.state.isProficient,
            },
            formatEquipmentPickerDetails(item.equipment),
          )}
        </Text>
      )}
    />
  )
}
