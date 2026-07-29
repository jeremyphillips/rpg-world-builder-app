'use client'

import * as React from 'react'

import { getOrganizationKindLabel } from '@rpg/contracts'
import { Badge, CatalogPickerSheet, SelectField } from '@rpg/ui'

import { CatalogPickerItemHeader } from '../picker/catalog-picker-item-header.client'
import { CatalogPickerSelectionActions } from '../picker/catalog-picker-selection-actions.client'
import { catalogPickerShellProps } from '../picker/catalog-picker-shell.lib'
import { CatalogToolbarResetSlot } from '../picker/catalog-toolbar-reset-action.client'
import {
  buildOrganizationPickerTypeOptions,
  filterAndSortOrganizationPickerItems,
  formatOrganizationPickerDescription,
  getOrganizationPickerSearchText,
  ORGANIZATION_PICKER_VIEW_DEFAULTS,
} from './organization-picker-drawer.lib'
import {
  ORGANIZATION_PICKER_ALL_TYPES,
  ORGANIZATION_PICKER_NO_ITEMS_MESSAGE,
  ORGANIZATION_PICKER_NO_RESULTS_MESSAGE,
  ORGANIZATION_PICKER_RESET_VIEW_LABEL,
  type OrganizationPickerDrawerProps,
  type OrganizationPickerTypeFilter,
} from './organization-picker-drawer.types'
import { organizationPickerTypeControlClasses } from './organization-picker-drawer.variants'

export type { OrganizationPickerDrawerProps } from './organization-picker-drawer.types'

export function OrganizationPickerDrawer({
  open,
  onOpenChange,
  items,
  selectedCount,
  onAdd,
  onRemove,
}: OrganizationPickerDrawerProps) {
  const [type, setType] = React.useState<OrganizationPickerTypeFilter>(
    ORGANIZATION_PICKER_VIEW_DEFAULTS.type,
  )
  const typeOptions = React.useMemo(
    () => buildOrganizationPickerTypeOptions(items.map(({ organization }) => organization)),
    [items],
  )
  const transformVisibleItems = React.useCallback(
    (visibleItems: readonly (typeof items)[number][], context: { searchQuery: string }) =>
      filterAndSortOrganizationPickerItems(visibleItems, {
        searchQuery: context.searchQuery,
        type,
      }),
    [type],
  )

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Choose organizations"
      description={formatOrganizationPickerDescription(selectedCount)}
      {...catalogPickerShellProps()}
      items={items}
      getItemKey={({ organization }) => organization.id}
      getItemToolbarLabel={({ organization }) => organization.name}
      getSearchText={({ organization }) => getOrganizationPickerSearchText(organization)}
      searchPlaceholder="Search organizations"
      noResultsMessage={ORGANIZATION_PICKER_NO_RESULTS_MESSAGE}
      noItemsMessage={ORGANIZATION_PICKER_NO_ITEMS_MESSAGE}
      transformVisibleItems={transformVisibleItems}
      hasStructuredFilters={type !== ORGANIZATION_PICKER_ALL_TYPES}
      actions={({ searchQuery, resetSearchQuery }) => {
        const showReset = searchQuery.length > 0 || type !== ORGANIZATION_PICKER_VIEW_DEFAULTS.type
        const handleReset = () => {
          setType(ORGANIZATION_PICKER_VIEW_DEFAULTS.type)
          resetSearchQuery()
        }

        return (
          <CatalogToolbarResetSlot
            visible={showReset}
            label={ORGANIZATION_PICKER_RESET_VIEW_LABEL}
            onClick={handleReset}
          />
        )
      }}
      filterRow={{
        controls: (
          <div className={organizationPickerTypeControlClasses}>
            <SelectField
              id="organization-picker-type"
              label="Type"
              labelPosition="inline"
              value={type}
              options={typeOptions}
              onValueChange={(value) => setType(value as OrganizationPickerTypeFilter)}
            />
          </div>
        ),
      }}
      renderItemHeader={({ organization, selected }) => (
        <CatalogPickerItemHeader
          name={organization.name}
          metadataLines={[
            {
              segments: [
                {
                  type: 'text',
                  text: getOrganizationKindLabel(organization.organizationKind),
                },
              ],
            },
          ]}
          actions={
            <CatalogPickerSelectionActions
              selected={selected}
              canSelect
              onAdd={() => onAdd(organization.id)}
              onRemove={() => onRemove(organization.id)}
            />
          }
          footer={selected ? <Badge tone="success">Selected</Badge> : undefined}
        />
      )}
    />
  )
}
