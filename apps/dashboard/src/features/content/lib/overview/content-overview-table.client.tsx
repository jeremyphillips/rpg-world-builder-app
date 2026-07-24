'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import {
  CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
  type CampaignAvailabilityFilter,
  type ContentTypeKey,
  type WithCampaignAccess,
} from '@rpg/contracts'
import {
  Button,
  DataTable,
  dataTableFilterNoticeVariants,
  dataTableRowUnavailableRailVariants,
  dataTableRowUnavailableVariants,
  type ColumnDef,
  type ColumnChangeState,
} from '@rpg/ui'
import {
  FilterAdvancedPanel,
  FilterBar,
  applyFilterSchema,
  getEffectiveFilterValue,
  getSchemaFieldsByPlacement,
  type FilterFieldId,
  type FilterSchema,
} from '@rpg/ui/filters'

import { getContentTypeMidSentenceLabel } from '../content-type-labels'
import {
  CAMPAIGN_ACCESS_TABLE_HIDE_UNAVAILABLE_LABEL,
  CAMPAIGN_ACCESS_TABLE_SHOW_ALL_LABEL,
  CAMPAIGN_ACCESS_TABLE_SHOW_UNAVAILABLE_LABEL,
  formatHiddenUnavailableNotice,
  formatHideUnavailableAriaLabel,
  formatNoAvailableMatchesLabel,
  formatShowAllCampaignAvailabilityAriaLabel,
  formatShowUnavailableAriaLabel,
  formatUnavailableItemsShownNotice,
  formatUnavailableMatchesLine,
} from '../campaign-access/campaign-access-table-labels'
import {
  buildContentOverviewColumnSchema,
  getContentOverviewSortableColumnIds,
} from './content-overview-columns.lib'
import { useStableOverviewColumns } from './content-overview-columns.client'
import {
  hydrateContentOverviewPreferences,
  persistContentOverviewPreferences,
  type ContentOverviewPreferences,
} from './content-overview-preferences'
import { ContentOverviewRowActions } from './content-overview-row-actions'
import {
  CAMPAIGN_AVAILABILITY_FILTER_ID,
  deriveCampaignAvailabilityScope,
} from './content-availability-table.lib'
import type { ContentBase } from './content-table-config'
import type { ContentOverviewBaseFilterState } from './content-overview-filter-schema'
import { useContentOverviewQueryState } from './use-content-overview-query-state.client'

const EDIT_DETAILS_LABEL = 'Edit details'
const DEFAULT_OVERVIEW_SORT = { id: 'name' } as const

function applyFilterSchemaExcluding<
  T extends WithCampaignAccess<ContentBase>,
  TFilters extends ContentOverviewBaseFilterState,
>(
  schema: FilterSchema<T, TFilters>,
  state: TFilters,
  rows: T[],
  excludedFieldIds: ReadonlyArray<FilterFieldId<TFilters>>,
): T[] {
  return rows.filter((row) =>
    schema.fields.every((field) => {
      if (excludedFieldIds.includes(field.id as FilterFieldId<TFilters>)) return true

      const effective = getEffectiveFilterValue(schema, state, field.id as FilterFieldId<TFilters>)
      if (effective === undefined) return true

      const isValueConstraining =
        field.isValueConstraining ?? ((value: unknown) => value !== undefined)
      if (!isValueConstraining(effective)) return true

      return field.matches(row, effective, state)
    }),
  )
}

export type ContentOverviewTableProps<
  T extends WithCampaignAccess<ContentBase> & { id: string },
  TFilters extends ContentOverviewBaseFilterState = ContentOverviewBaseFilterState,
> = {
  contentTypeKey: ContentTypeKey
  campaignId: string
  columns: ColumnDef<T, unknown>[]
  filterSchema: FilterSchema<T, TFilters>
  data: T[]
  caption?: string
  getEditHref: (row: T) => string
}

export function ContentOverviewTable<
  T extends WithCampaignAccess<ContentBase> & { id: string },
  TFilters extends ContentOverviewBaseFilterState = ContentOverviewBaseFilterState,
>({
  contentTypeKey,
  campaignId,
  columns,
  filterSchema,
  data,
  caption,
  getEditHref,
}: ContentOverviewTableProps<T, TFilters>) {
  const tableRootRef = useRef<HTMLDivElement>(null)
  const actionTriggerRefs = useRef(new Map<string, HTMLButtonElement>())
  const stableColumns = useStableOverviewColumns(columns)
  const columnSchema = useMemo(
    () => buildContentOverviewColumnSchema(stableColumns as ColumnDef<unknown>[]),
    [stableColumns],
  )
  const [preferences, setPreferences] = useState<ContentOverviewPreferences>(() =>
    hydrateContentOverviewPreferences(contentTypeKey, columnSchema),
  )
  const [advancedOpen, setAdvancedOpen] = useState(preferences.advancedOpen ?? false)
  const allowedSortIds = useMemo(
    () => getContentOverviewSortableColumnIds(stableColumns as ColumnDef<unknown>[]),
    [stableColumns],
  )
  const hasAdvancedFields = useMemo(
    () => getSchemaFieldsByPlacement(filterSchema, 'advanced').length > 0,
    [filterSchema],
  )
  const { query, actions } = useContentOverviewQueryState<T, TFilters>({
    schema: filterSchema,
    allowedSortIds,
    defaultSort: DEFAULT_OVERVIEW_SORT,
  })

  const campaignAvailabilityFilterId = CAMPAIGN_AVAILABILITY_FILTER_ID as FilterFieldId<TFilters>

  const filterState = query.filters
  const campaignAvailability =
    (getEffectiveFilterValue(filterSchema, filterState, campaignAvailabilityFilterId) as
      | CampaignAvailabilityFilter
      | undefined) ?? CAMPAIGN_AVAILABILITY_FILTER_DEFAULT

  const scopedRows = useMemo(
    () =>
      applyFilterSchemaExcluding(filterSchema, filterState, data, [campaignAvailabilityFilterId]),
    [data, filterSchema, filterState],
  )

  const scope = useMemo(
    () => deriveCampaignAvailabilityScope(scopedRows, { campaignAvailability }),
    [campaignAvailability, scopedRows],
  )

  const visibleRows = useMemo(
    () => applyFilterSchema(filterSchema, filterState, data),
    [data, filterSchema, filterState],
  )

  const pluralNoun = getContentTypeMidSentenceLabel(contentTypeKey, { plural: true })
  const itemLabel = getContentTypeMidSentenceLabel(contentTypeKey)

  const handleAdvancedOpenChange = useCallback(
    (open: boolean) => {
      setAdvancedOpen(open)
      setPreferences((current) => {
        const next = { ...current, advancedOpen: open }
        persistContentOverviewPreferences(contentTypeKey, next)
        return next
      })
    },
    [contentTypeKey],
  )

  const handleColumnChange = useCallback(
    (state: ColumnChangeState) => {
      setPreferences((current) => {
        const nextVisibility = state.visibility
        const nextOrder = state.order
        const visibilityUnchanged =
          JSON.stringify(current.columnVisibility ?? {}) === JSON.stringify(nextVisibility)
        const orderUnchanged =
          JSON.stringify(current.columnOrder ?? []) === JSON.stringify(nextOrder)
        if (visibilityUnchanged && orderUnchanged) return current

        const next = {
          ...current,
          columnVisibility: nextVisibility,
          columnOrder: nextOrder,
        }
        persistContentOverviewPreferences(contentTypeKey, next)
        return next
      })
    },
    [contentTypeKey],
  )

  const handleFilterValueChange = useCallback(
    (id: FilterFieldId<TFilters>, value: unknown) => {
      actions.setFilterValue(id, value as TFilters[typeof id])
    },
    [actions],
  )

  const restoreFocusAfterRowRemoved = useCallback(
    (removedRowId: string) => {
      const orderedIds = visibleRows.map((row) => row.id)
      const removedIndex = orderedIds.indexOf(removedRowId)
      const candidateIds = [
        ...orderedIds.slice(removedIndex + 1),
        ...orderedIds.slice(0, removedIndex).reverse(),
      ]

      for (const candidateId of candidateIds) {
        const trigger = actionTriggerRefs.current.get(candidateId)
        if (trigger) {
          trigger.focus()
          return
        }
      }

      tableRootRef.current?.focus()
    },
    [visibleRows],
  )

  const filterNotice = useMemo(() => {
    if (scope.unavailableCount === 0) return null

    if (campaignAvailability === 'available') {
      return (
        <>
          <span>{formatHiddenUnavailableNotice(scope.unavailableCount)}</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto px-0 text-xs"
            aria-label={formatShowAllCampaignAvailabilityAriaLabel()}
            onClick={() =>
              actions.setFilterValue(
                campaignAvailabilityFilterId,
                'all' as TFilters[FilterFieldId<TFilters>],
                { history: 'push' },
              )
            }
          >
            {CAMPAIGN_ACCESS_TABLE_SHOW_ALL_LABEL}
          </Button>
        </>
      )
    }

    if (campaignAvailability === 'all') {
      return (
        <>
          <span>{formatUnavailableItemsShownNotice()}</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto px-0 text-xs"
            aria-label={formatHideUnavailableAriaLabel()}
            onClick={() =>
              actions.setFilterValue(
                campaignAvailabilityFilterId,
                'available' as TFilters[FilterFieldId<TFilters>],
                { history: 'push' },
              )
            }
          >
            {CAMPAIGN_ACCESS_TABLE_HIDE_UNAVAILABLE_LABEL}
          </Button>
        </>
      )
    }

    return null
  }, [actions, campaignAvailability, scope.unavailableCount])

  const emptyState = useCallback(() => {
    if (
      campaignAvailability === 'available' &&
      scope.unavailableCount > 0 &&
      scope.visibleCount === 0
    ) {
      return (
        <div className="space-y-1 text-center">
          <p>{formatNoAvailableMatchesLabel(pluralNoun)}</p>
          <p className="text-muted-foreground">
            {formatUnavailableMatchesLine(scope.unavailableCount, pluralNoun)}{' '}
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto px-0 text-xs"
              aria-label={formatShowUnavailableAriaLabel(pluralNoun)}
              onClick={() =>
                actions.setFilterValue(
                  campaignAvailabilityFilterId,
                  'unavailable' as TFilters[FilterFieldId<TFilters>],
                  { history: 'push' },
                )
              }
            >
              {CAMPAIGN_ACCESS_TABLE_SHOW_UNAVAILABLE_LABEL}
            </Button>
          </p>
        </div>
      )
    }

    return <p>No results.</p>
  }, [actions, campaignAvailability, pluralNoun, scope.unavailableCount, scope.visibleCount])

  return (
    <div ref={tableRootRef} tabIndex={-1} className="flex flex-col gap-3 outline-none">
      <FilterBar
        schema={filterSchema}
        state={filterState}
        onValueChange={handleFilterValueChange}
        onReset={() => actions.resetFilters()}
        advancedOpen={advancedOpen}
        onAdvancedOpenChange={hasAdvancedFields ? handleAdvancedOpenChange : undefined}
      />

      <FilterAdvancedPanel
        schema={filterSchema}
        state={filterState}
        onValueChange={handleFilterValueChange}
        open={advancedOpen}
        onClearAll={() => actions.resetFilters()}
      />

      {filterNotice ? <div className={dataTableFilterNoticeVariants()}>{filterNotice}</div> : null}

      <DataTable
        columns={stableColumns}
        data={visibleRows}
        showFilterControls={false}
        defaultPageSize={preferences.pageSize}
        initialColumnVisibility={preferences.columnVisibility}
        initialColumnOrder={preferences.columnOrder}
        onColumnChange={handleColumnChange}
        rowActions={(row) => (
          <ContentOverviewRowActions
            campaignId={campaignId}
            contentTypeKey={contentTypeKey}
            entityId={row.id}
            editHref={getEditHref(row)}
            itemLabel={itemLabel}
            campaignAccess={row.campaignAccess}
            campaignAvailabilityFilter={campaignAvailability}
            editLabel={EDIT_DETAILS_LABEL}
            onRowRemoved={() => restoreFocusAfterRowRemoved(row.id)}
            triggerRef={(element) => {
              if (element) {
                actionTriggerRefs.current.set(row.id, element)
              } else {
                actionTriggerRefs.current.delete(row.id)
              }
            }}
          />
        )}
        caption={caption}
        emptyState={emptyState}
        getRowClassName={(row) =>
          row.original.campaignAccess.available ? undefined : dataTableRowUnavailableVariants()
        }
        getCellClassName={(cell) => {
          if (cell.row.original.campaignAccess.available) return undefined
          const [firstCell] = cell.row.getVisibleCells()
          if (cell.id !== firstCell?.id) return undefined
          return dataTableRowUnavailableRailVariants()
        }}
      />
    </div>
  )
}
