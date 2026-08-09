'use client'

import * as React from 'react'

import { getOrganizationKindLabel, resolveOrganizationMemberTitleSuggestions } from '@rpg/contracts'
import { Badge, Button, CatalogPickerSheet, RadioGroupField, SelectField } from '@rpg/ui'

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
  ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
  ORGANIZATION_PICKER_ALL_TYPES,
  ORGANIZATION_PICKER_NO_ITEMS_MESSAGE,
  ORGANIZATION_PICKER_NO_RESULTS_MESSAGE,
  ORGANIZATION_PICKER_RESET_VIEW_LABEL,
  ORGANIZATION_PICKER_TITLE,
  type OrganizationMembershipSelection,
  type OrganizationPickerDrawerProps,
  type OrganizationPickerTypeFilter,
} from './organization-picker-drawer.types'
import { organizationPickerTypeControlClasses } from './organization-picker-drawer.variants'

export type { OrganizationPickerDrawerProps } from './organization-picker-drawer.types'

function buildTitleRadioOptions(
  organization: OrganizationPickerDrawerProps['items'][number]['organization'],
) {
  const suggestions = resolveOrganizationMemberTitleSuggestions({
    kind: organization.organizationKind,
    subtype: organization.organizationSubtype,
  })
  return [
    { value: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE, label: 'No title' },
    ...suggestions.map((title) => ({ value: title, label: title })),
  ]
}

export function OrganizationPickerDrawer({
  open,
  onOpenChange,
  items,
  onAdd,
}: OrganizationPickerDrawerProps) {
  const [type, setType] = React.useState<OrganizationPickerTypeFilter>(
    ORGANIZATION_PICKER_VIEW_DEFAULTS.type,
  )
  const [expandedItemId, setExpandedItemId] = React.useState<string | null>(null)
  const [selectedTitle, setSelectedTitle] = React.useState(ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)

  const resetMembershipConfig = React.useCallback(() => {
    setExpandedItemId(null)
    setSelectedTitle(ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)
  }, [])

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetMembershipConfig()
      onOpenChange(nextOpen)
    },
    [onOpenChange, resetMembershipConfig],
  )

  const handleExpandedItemChange = React.useCallback((itemId: string | null) => {
    setExpandedItemId(itemId)
    setSelectedTitle(ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)
  }, [])

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

  const commitMembership = React.useCallback(
    (organizationId: string) => {
      const membership: OrganizationMembershipSelection = {
        organizationId,
        ...(selectedTitle !== ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE
          ? { title: selectedTitle }
          : {}),
      }
      onAdd(membership)
      resetMembershipConfig()
      onOpenChange(false)
    },
    [onAdd, onOpenChange, resetMembershipConfig, selectedTitle],
  )

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={ORGANIZATION_PICKER_TITLE}
      description={formatOrganizationPickerDescription()}
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
      expandedItemId={expandedItemId}
      onExpandedItemChange={handleExpandedItemChange}
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
            selected ? (
              <CatalogPickerSelectionActions
                phase="success"
                onAdd={() => undefined}
                onRemove={() => undefined}
              />
            ) : (
              <CatalogPickerSelectionActions
                canSelect
                onAdd={() => handleExpandedItemChange(organization.id)}
                onRemove={() => undefined}
              />
            )
          }
          footer={selected ? <Badge tone="success">Added</Badge> : undefined}
        />
      )}
      renderItemDetails={({ organization, selected }) => {
        if (selected) return null
        return (
          <div className="flex flex-col gap-4">
            <RadioGroupField
              id={`organization-membership-title-${organization.id}`}
              label="Title"
              options={buildTitleRadioOptions(organization)}
              value={
                expandedItemId === organization.id
                  ? selectedTitle
                  : ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE
              }
              onValueChange={setSelectedTitle}
            />
            <div className="flex justify-end">
              <Button type="button" onClick={() => commitMembership(organization.id)}>
                Add organization
              </Button>
            </div>
          </div>
        )
      }}
    />
  )
}
