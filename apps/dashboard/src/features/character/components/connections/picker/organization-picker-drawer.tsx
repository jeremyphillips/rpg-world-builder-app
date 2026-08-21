import * as React from 'react'

import { getOrganizationDomainLabel, resolveOrganizationMembershipMetadata } from '@rpg/contracts'
import { Button, SelectField, Text, CatalogPickerSelectionActions } from '@rpg/ui'

import {
  CatalogEntityPickerSheet,
  CatalogEntityRow,
  CatalogMetadataRenderer,
} from '@/features/content'
import { CatalogToolbarResetSlot } from '../../picker/catalog-toolbar-reset-action'
import { OrganizationMembershipTitleField } from '../organization-membership-title-field'
import {
  ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
  titleFromMembershipRadioValue,
} from '../../../lib/organization-membership/organization-membership-title.lib'
import {
  buildOrganizationPickerDomainOptions,
  filterAndSortOrganizationPickerItems,
  formatOrganizationPickerDescription,
  getOrganizationPickerSearchText,
  ORGANIZATION_PICKER_VIEW_DEFAULTS,
} from './organization-picker-drawer.lib'
import {
  ORGANIZATION_PICKER_ALL_DOMAINS,
  ORGANIZATION_PICKER_NO_ITEMS_MESSAGE,
  ORGANIZATION_PICKER_NO_RESULTS_MESSAGE,
  ORGANIZATION_PICKER_RESET_VIEW_LABEL,
  ORGANIZATION_PICKER_TITLE,
  type OrganizationMembershipSelection,
  type OrganizationPickerDrawerProps,
  type OrganizationPickerItem,
  type OrganizationPickerDomainFilter,
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
  const [domain, setDomain] = React.useState<OrganizationPickerDomainFilter>(
    ORGANIZATION_PICKER_VIEW_DEFAULTS.domain,
  )
  const [expandedItemId, setExpandedItemId] = React.useState<string | null>(null)
  const [selectedTitle, setSelectedTitle] = React.useState(ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)
  const [pending, setPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const resetMembershipConfig = React.useCallback(() => {
    setDomain(ORGANIZATION_PICKER_VIEW_DEFAULTS.domain)
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

  const domainOptions = React.useMemo(
    () => buildOrganizationPickerDomainOptions(items.map(({ organization }) => organization)),
    [items],
  )
  const transformVisibleItems = React.useCallback(
    (visibleItems: readonly (typeof items)[number][], context: { searchQuery: string }) =>
      filterAndSortOrganizationPickerItems(visibleItems, {
        searchQuery: context.searchQuery,
        domain,
      }),
    [domain],
  )

  const commitMembership = React.useCallback(
    async (organization: OrganizationPickerItem['organization']) => {
      if (pending) return

      const { title, priority } = resolveOrganizationMembershipMetadata({
        titles: organization.members.titles ?? [],
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
    <CatalogEntityPickerSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={ORGANIZATION_PICKER_TITLE}
      description={formatOrganizationPickerDescription()}
      items={items}
      getItemKey={({ organization }) => organization.id}
      getItemToolbarLabel={({ organization }) => organization.name}
      getSearchText={({ organization }) => getOrganizationPickerSearchText(organization)}
      searchPlaceholder="Search organizations"
      noResultsMessage={ORGANIZATION_PICKER_NO_RESULTS_MESSAGE}
      noItemsMessage={ORGANIZATION_PICKER_NO_ITEMS_MESSAGE}
      transformVisibleItems={transformVisibleItems}
      hasStructuredFilters={domain !== ORGANIZATION_PICKER_ALL_DOMAINS}
      expandedItemId={expandedItemId}
      onExpandedItemChange={handleExpandedItemChange}
      actions={({ searchQuery, resetSearchQuery }) => {
        const showReset =
          searchQuery.length > 0 || domain !== ORGANIZATION_PICKER_VIEW_DEFAULTS.domain
        const handleReset = () => {
          setDomain(ORGANIZATION_PICKER_VIEW_DEFAULTS.domain)
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
              id="organization-picker-domain"
              label="Domain"
              labelPosition="inline"
              value={domain}
              options={domainOptions}
              onValueChange={(value) => setDomain(value as OrganizationPickerDomainFilter)}
            />
          </div>
        ),
      }}
      renderEntityRow={(args) => {
        const { organization, selected } = args.item

        return (
          <CatalogEntityRow
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
                <CatalogMetadataRenderer
                  lines={[
                    {
                      segments: [
                        {
                          type: 'text',
                          text: getOrganizationDomainLabel(organization.organizationDomain),
                        },
                      ],
                    },
                  ]}
                />
              ),
              status: selected ? [{ kind: 'badge', label: 'Added', tone: 'success' }] : undefined,
            }}
            trailing={
              selected
                ? undefined
                : {
                    kind: 'action',
                    content: (
                      <CatalogPickerSelectionActions
                        canSelect
                        onAdd={() => handleExpandedItemChange(organization.id)}
                        onRemove={() => undefined}
                      />
                    ),
                  }
            }
          />
        )
      }}
      renderItemDetails={({ organization, selected }) => {
        if (selected) return null
        return (
          <div className="flex flex-col gap-4">
            <OrganizationMembershipTitleField
              titles={organization.members.titles ?? []}
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
