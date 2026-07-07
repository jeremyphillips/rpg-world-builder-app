'use client'

import * as React from 'react'

import { Badge, Button, CatalogPickerSheet, PreviewCard, Text, cn } from '@rpg/ui'
import { getEquipmentKindLabel, type EquipmentKind } from '@rpg/contracts'

import {
  filterEquipmentPickerItems,
  formatEquipmentBudgetWealth,
  formatEquipmentPickerDetails,
  formatEquipmentPickerSummaryLine,
  getEquipmentPickerBadgeLabel,
  getEquipmentPickerDisabledNote,
  getEquipmentPickerItemTab,
  isEquipmentPickerItemDisabled,
  resolveEquipmentKindFilterOptions,
} from './equipment-picker-drawer.lib'
import {
  EQUIPMENT_PICKER_TAB_ALL,
  EQUIPMENT_PICKER_TAB_RECOMMENDED,
  type EquipmentPickerDrawerProps,
  type EquipmentPickerItem,
} from './equipment-picker-drawer.types'
import {
  equipmentPickerBudgetClasses,
  equipmentPickerBudgetLabelClasses,
  equipmentPickerBudgetValueClasses,
  equipmentPickerDisabledRowClasses,
  equipmentPickerKindChipActiveClasses,
  equipmentPickerKindChipInactiveClasses,
  equipmentPickerKindFiltersClasses,
  equipmentPickerWarningBadgeClasses,
} from './equipment-picker-drawer.variants'

export type { EquipmentPickerDrawerProps } from './equipment-picker-drawer.types'

function EquipmentBudgetHeader({
  budget,
}: {
  budget: NonNullable<EquipmentPickerDrawerProps['budget']>
}) {
  return (
    <dl className={equipmentPickerBudgetClasses}>
      <div>
        <dt className={equipmentPickerBudgetLabelClasses}>Starting</dt>
        <dd className={equipmentPickerBudgetValueClasses}>
          {formatEquipmentBudgetWealth(budget.starting)}
        </dd>
      </div>
      <div>
        <dt className={equipmentPickerBudgetLabelClasses}>Spent</dt>
        <dd className={equipmentPickerBudgetValueClasses}>
          {formatEquipmentBudgetWealth(budget.spent)}
        </dd>
      </div>
      <div>
        <dt className={equipmentPickerBudgetLabelClasses}>Remaining</dt>
        <dd className={equipmentPickerBudgetValueClasses}>
          {formatEquipmentBudgetWealth(budget.remaining)}
        </dd>
      </div>
    </dl>
  )
}

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
  addCount,
  onAdd,
}: {
  item: EquipmentPickerItem
  budget?: EquipmentPickerDrawerProps['budget']
  addCount: number
  onAdd: () => void
}) {
  const disabled = isEquipmentPickerItemDisabled(item)
  const badgeLabel = getEquipmentPickerBadgeLabel(item)
  const disabledNote = getEquipmentPickerDisabledNote(item, budget)

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
            <Button type="button" size="sm" disabled={disabled} onClick={onAdd}>
              {addCount > 0 ? `Add another (${addCount + 1})` : 'Add'}
            </Button>
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
  onAddItem,
}: EquipmentPickerDrawerProps) {
  const kindOptions = React.useMemo(
    () => resolveEquipmentKindFilterOptions(items, allowedKinds),
    [allowedKinds, items],
  )
  const [selectedKinds, setSelectedKinds] = React.useState(kindOptions)
  const [addCounts, setAddCounts] = React.useState<Record<string, number>>({})

  React.useEffect(() => {
    if (!open) {
      setAddCounts({})
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
      setAddCounts((current) => ({
        ...current,
        [itemKey]: (current[itemKey] ?? 0) + 1,
      }))
      onAddItem(item, 1)
    },
    [onAddItem],
  )

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
          addCount={addCounts[item.equipment.id] ?? 0}
          onAdd={() => handleAddItem(item)}
        />
      )}
      renderItemDetails={(item) => (
        <Text as="p" variant="muted" className="whitespace-pre-line">
          {formatEquipmentPickerDetails(item.equipment)}
        </Text>
      )}
    />
  )
}
