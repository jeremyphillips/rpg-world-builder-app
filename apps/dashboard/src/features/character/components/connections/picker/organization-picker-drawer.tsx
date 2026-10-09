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
import {
  resolvePickerMutationCopy,
  resolvePickerPendingLabel,
} from '../../../lib/picker/picker-mutation-family'
import { resolvePickerSelectionStateLine } from '../../../lib/picker/picker-selection-state'
import { hasCatalogPickerResetViewCriteria } from '../../picker/catalog-picker-filter-state.lib'
import {
  hasCatalogPickerNarrowingCriteria,
  resolveCatalogPickerResultSummary,
} from '../../picker/catalog-picker-filter-state.lib'
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
  ORGANIZATION_PICKER_COPY,
  ORGANIZATION_PICKER_NO_ITEMS_MESSAGE,
  ORGANIZATION_PICKER_NO_RESULTS_MESSAGE,
  type OrganizationMembershipSelection,
  type OrganizationPickerDrawerProps,
  type OrganizationPickerItem,
} from './organization-picker-drawer.types'

export type { OrganizationPickerDrawerProps } from './organization-picker-drawer.types'

const ORGANIZATION_ROW_LABEL = resolvePickerMutationCopy('genericSelection').acquire
const ORGANIZATION_ROW_PENDING_LABEL = resolvePickerPendingLabel('genericSelection', 'acquire')

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
  const [failedOrganizationId, setFailedOrganizationId] = React.useState<string | null>(null)

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
    setFailedOrganizationId(null)
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
      setFailedOrganizationId(null)
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
      setFailedOrganizationId(null)
      try {
        await onAdd(membership)
        resetMembershipConfig()
        onOpenChange(false)
      } catch {
        setFailedOrganizationId(organization.id)
        setPending(false)
      }
    },
    [onAdd, onOpenChange, pending, resetMembershipConfig, selectedTitle],
  )

  return (
    <CatalogEntityPickerSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={ORGANIZATION_PICKER_COPY.chooseTitle}
      description={formatOrganizationPickerDescription()}
      items={organizationFilters.filteredRows}
      getItemKey={({ organization }) => organization.id}
      getItemToolbarLabel={({ organization }) => organization.name}
      getSearchText={({ organization }) => getOrganizationPickerSearchText(organization)}
      searchPlaceholder={ORGANIZATION_PICKER_COPY.searchPlaceholder}
      noResultsMessage={ORGANIZATION_PICKER_NO_RESULTS_MESSAGE}
      noItemsMessage={ORGANIZATION_PICKER_NO_ITEMS_MESSAGE}
      transformVisibleItems={transformVisibleItems}
      hasStructuredFilters={organizationFilters.structuredFilterCount > 0}
      expandedItemId={expandedItemId}
      onExpandedItemChange={handleExpandedItemChange}
      actions={({ searchQuery, resetSearchQuery, visibleItemCount }) => {
        const showReset = hasCatalogPickerResetViewCriteria({
          structuredFilterCount: organizationFilters.structuredFilterCount,
          searchQuery,
        })
        return (
          <CatalogToolbarResetSlot
            visible={showReset}
            reserve={showDomainFilter}
            includesSort={false}
            {...resolveCatalogPickerResultSummary({
              visible: visibleItemCount,
              total: organizationFilters.sourceCount,
              narrowing: hasCatalogPickerNarrowingCriteria({
                structuredFilterCount: organizationFilters.structuredFilterCount,
                searchQuery,
              }),
            })}
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
                selected
                  ? { selectionState: resolvePickerSelectionStateLine({ kind: 'selected' }) }
                  : {},
              ),
              inlineAction: selected
                ? undefined
                : {
                    label: ORGANIZATION_ROW_LABEL,
                    pendingLabel: ORGANIZATION_ROW_PENDING_LABEL,
                    entityKey: organization.id,
                    failed: failedOrganizationId === organization.id,
                    loading: pending && expandedItemId === organization.id,
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
                {ORGANIZATION_PICKER_COPY.addLabel}
              </Button>
            </div>
          </div>
        )
      }}
    />
  )
}
