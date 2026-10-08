import * as React from 'react'

import {
  resolveOrganizationMembershipMetadata,
  resolveSoleOrganizationMembershipTitleId,
} from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'

import {
  CatalogEntityPickerSheet,
  CatalogEntitySurfaceRow,
  RelationshipCatalogFilterBand,
  buildOrganizationEntityCardModel,
  buildOrganizationEntitySummaryVm,
  createOrganizationRelationshipFilterSchema,
  relationshipCatalogFilterHasBand,
  resolveOrganizationRelationshipFilterLayout,
  useRelationshipCatalogFilters,
} from '@/features/content'
import { hasCatalogPickerResetViewCriteria } from '../../picker/catalog-picker-filter-state.lib'
import { CatalogToolbarResetSlot } from '../../picker/catalog-toolbar-reset-action'
import { OrganizationMembershipTitleField } from '../organization-membership-title-field'
import { titleFromMembershipRadioValue } from '../../../lib/organization-membership/organization-membership-title.lib'
import {
  filterAndSortOrganizationPickerItems,
  formatOrganizationPickerDescription,
  getOrganizationPickerSearchText,
} from './organization-picker-drawer.lib'
import {
  ORGANIZATION_PICKER_ALL_DOMAINS,
  ORGANIZATION_PICKER_NO_ITEMS_MESSAGE,
  ORGANIZATION_PICKER_NO_RESULTS_MESSAGE,
  ORGANIZATION_PICKER_TITLE,
  type OrganizationMembershipSelection,
  type OrganizationPickerDrawerProps,
  type OrganizationPickerItem,
} from './organization-picker-drawer.types'

export type { OrganizationPickerDrawerProps } from './organization-picker-drawer.types'

const ORGANIZATION_PICKER_SUBMIT_FAILED_MESSAGE = 'Could not add this organization membership.'

export function OrganizationPickerDrawer({
  open,
  onOpenChange,
  items,
  onAdd,
}: OrganizationPickerDrawerProps) {
  const [expandedItemId, setExpandedItemId] = React.useState<string | null>(null)
  const [selectedTitle, setSelectedTitle] = React.useState<string | undefined>(undefined)
  const [pending, setPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const organizationFilterSchema = React.useMemo(
    () =>
      createOrganizationRelationshipFilterSchema({
        rows: items,
        getDomain: (item) => item.organization.organizationDomain,
      }),
    [items],
  )
  const organizationFilterLayout = React.useMemo(
    () => resolveOrganizationRelationshipFilterLayout(organizationFilterSchema),
    [organizationFilterSchema],
  )
  const organizationFilters = useRelationshipCatalogFilters({
    rows: items,
    schema: organizationFilterSchema,
  })
  const showDomainFilter = relationshipCatalogFilterHasBand(
    'filterRow',
    organizationFilterSchema,
    organizationFilterLayout,
  )

  const resetMembershipConfig = React.useCallback(() => {
    organizationFilters.reset()
    setExpandedItemId(null)
    setSelectedTitle(undefined)
    setSubmitError(null)
    setPending(false)
  }, [organizationFilters.reset])

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (pending) return
      if (!nextOpen) resetMembershipConfig()
      onOpenChange(nextOpen)
    },
    [onOpenChange, pending, resetMembershipConfig],
  )

  const handleExpandedItemChange = React.useCallback(
    (itemId: string | null) => {
      setExpandedItemId(itemId)
      const organization = items.find(
        ({ organization }) => organization.id === itemId,
      )?.organization
      setSelectedTitle(
        organization
          ? resolveSoleOrganizationMembershipTitleId(organization.members.titles ?? [])
          : undefined,
      )
      setSubmitError(null)
    },
    [items],
  )

  const transformVisibleItems = React.useCallback(
    (visibleItems: readonly (typeof items)[number][], context: { searchQuery: string }) =>
      filterAndSortOrganizationPickerItems(visibleItems, {
        searchQuery: context.searchQuery,
        domain: ORGANIZATION_PICKER_ALL_DOMAINS,
      }),
    [],
  )

  const commitMembership = React.useCallback(
    async (organization: OrganizationPickerItem['organization']) => {
      if (pending) return

      if (selectedTitle === undefined || selectedTitle.trim() === '') {
        setSubmitError('Choose a membership title before adding this organization.')
        return
      }

      const { membershipTitleId } = resolveOrganizationMembershipMetadata({
        titles: organization.members.titles ?? [],
        selectedMembershipTitleId: titleFromMembershipRadioValue(selectedTitle),
      })
      const membership: OrganizationMembershipSelection = {
        organizationId: organization.id,
        membershipTitleId,
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
      items={organizationFilters.filteredRows}
      getItemKey={({ organization }) => organization.id}
      getItemToolbarLabel={({ organization }) => organization.name}
      getSearchText={({ organization }) => getOrganizationPickerSearchText(organization)}
      searchPlaceholder="Search organizations"
      noResultsMessage={ORGANIZATION_PICKER_NO_RESULTS_MESSAGE}
      noItemsMessage={ORGANIZATION_PICKER_NO_ITEMS_MESSAGE}
      transformVisibleItems={transformVisibleItems}
      hasStructuredFilters={organizationFilters.structuredFilterCount > 0}
      expandedItemId={expandedItemId}
      onExpandedItemChange={handleExpandedItemChange}
      actions={({ searchQuery, resetSearchQuery }) => {
        const showReset = hasCatalogPickerResetViewCriteria({
          structuredFilterCount: organizationFilters.structuredFilterCount,
          searchQuery,
        })
        if (!showReset) return null

        return (
          <CatalogToolbarResetSlot
            visible
            includesSort={false}
            onClick={() => {
              organizationFilters.reset()
              resetSearchQuery()
            }}
          />
        )
      }}
      filterRow={
        showDomainFilter
          ? {
              controls: (
                <RelationshipCatalogFilterBand
                  band="filterRow"
                  schema={organizationFilterSchema}
                  layout={organizationFilterLayout}
                  state={organizationFilters.state}
                  data={items}
                  idPrefix="organization-picker"
                  onValueChange={organizationFilters.setValue}
                />
              ),
            }
          : undefined
      }
      renderEntityRow={(args) => {
        const { organization, selected } = args.item

        return (
          <CatalogEntitySurfaceRow
            toolbarLabel={args.toolbarLabel}
            domIds={args.domIds}
            collapsible={args.collapsible}
            collapsed={args.collapsed}
            onToggleCollapse={args.onToggleCollapse}
            summary={args.summary}
            details={args.details}
            surface={{
              identity: buildOrganizationEntityCardModel(
                buildOrganizationEntitySummaryVm(organization),
                {
                  status: selected
                    ? [{ kind: 'badge', label: 'Added', tone: 'success' }]
                    : undefined,
                },
              ),
              inlineAction: selected
                ? undefined
                : {
                    label: 'Add',
                    onClick: () => handleExpandedItemChange(organization.id),
                  },
            }}
          />
        )
      }}
      renderItemDetails={({ organization, selected }) => {
        if (selected) return null
        return (
          <div className="flex flex-col gap-4">
            <OrganizationMembershipTitleField
              titles={organization.members.titles ?? []}
              value={expandedItemId === organization.id ? selectedTitle : undefined}
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
