'use client'

import * as React from 'react'

import { getOrganizationKindLabel, resolveOrganizationMembershipMetadata } from '@rpg/contracts'
import { Badge, Button, CatalogPickerSheet, SelectField, Text } from '@rpg/ui'

import { CatalogPickerMetadataRenderer } from '../picker/catalog-picker-metadata'
import { CatalogEntityDisclosureRow } from '@/features/content'
import { CatalogPickerSelectionActions } from '../picker/catalog-picker-selection-actions.client'
import { catalogPickerShellProps } from '../picker/catalog-picker-shell.lib'
import { CatalogToolbarResetSlot } from '../picker/catalog-toolbar-reset-action.client'
import { OrganizationMembershipTitleField } from './organization-membership-title-field.client'
import { titleFromMembershipRadioValue } from './organization-membership-title-field.lib'
import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from './organization-membership-title-field.types'
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
  ORGANIZATION_PICKER_TITLE,
  type OrganizationMembershipSelection,
  type OrganizationPickerDrawerProps,
  type OrganizationPickerItem,
  type OrganizationPickerTypeFilter,
} from './organization-picker-drawer.types'
import { organizationPickerTypeControlClasses } from './organization-picker-drawer.variants'

export type { OrganizationPickerDrawerProps } from './organization-picker-drawer.types'

const ORGANIZATION_PICKER_SUBMIT_FAILED_MESSAGE = 'Could not add this organization membership.'

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
  const [pending, setPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const resetMembershipConfig = React.useCallback(() => {
    setExpandedItemId(null)
    setSelectedTitle(ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)
    setSubmitError(null)
    setPending(false)
  }, [])

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (pending) return
      if (!nextOpen) resetMembershipConfig()
      onOpenChange(nextOpen)
    },
    [onOpenChange, pending, resetMembershipConfig],
  )

  const handleExpandedItemChange = React.useCallback((itemId: string | null) => {
    setExpandedItemId(itemId)
    setSelectedTitle(ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)
    setSubmitError(null)
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
    async (organization: OrganizationPickerItem['organization']) => {
      if (pending) return

      const { title, priority } = resolveOrganizationMembershipMetadata({
        kind: organization.organizationKind,
        ...(organization.organizationSubtype !== undefined
          ? { subtype: organization.organizationSubtype }
          : {}),
        selectedTitle: titleFromMembershipRadioValue(selectedTitle),
      })
      const membership: OrganizationMembershipSelection = {
        organizationId: organization.id,
        ...(title !== undefined ? { title } : {}),
        ...(priority !== undefined ? { priority } : {}),
      }

      setPending(true)
      setSubmitError(null)
      try {
        await onAdd(membership)
        resetMembershipConfig()
        onOpenChange(false)
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : ORGANIZATION_PICKER_SUBMIT_FAILED_MESSAGE
        setSubmitError(message)
        setPending(false)
      }
    },
    [onAdd, onOpenChange, pending, resetMembershipConfig, selectedTitle],
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
      renderCollapsibleRow={(args) => {
        const { organization, selected } = args.item

        return (
          <CatalogEntityDisclosureRow
            toolbarLabel={args.toolbarLabel}
            domIds={args.domIds}
            collapsible={args.collapsible}
            collapsed={args.collapsed}
            onToggleCollapse={args.onToggleCollapse}
            summary={args.summary}
            details={args.details}
            entity={{
              heading: organization.name,
              description: (
                <CatalogPickerMetadataRenderer
                  lines={[
                    {
                      segments: [
                        {
                          type: 'text',
                          text: getOrganizationKindLabel(organization.organizationKind),
                        },
                      ],
                    },
                  ]}
                />
              ),
              status: selected
                ? [
                    <Badge key="added" tone="success">
                      Added
                    </Badge>,
                  ]
                : undefined,
            }}
            trailing={{
              kind: 'action',
              content: selected ? (
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
              ),
            }}
          />
        )
      }}
      renderItemDetails={({ organization, selected }) => {
        if (selected) return null
        return (
          <div className="flex flex-col gap-4">
            <OrganizationMembershipTitleField
              kind={organization.organizationKind}
              subtype={organization.organizationSubtype}
              value={
                expandedItemId === organization.id
                  ? selectedTitle
                  : ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE
              }
              onValueChange={setSelectedTitle}
              idPrefix={`organization-membership-${organization.id}`}
            />
            {submitError && expandedItemId === organization.id ? (
              <Text variant="destructive" role="alert">
                {submitError}
              </Text>
            ) : null}
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={pending}
                onClick={() => {
                  void commitMembership(organization)
                }}
              >
                Add organization
              </Button>
            </div>
          </div>
        )
      }}
    />
  )
}
