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
  dataTableRowUnavailableRailVariants,
  dataTableRowUnavailableVariants,
  type ColumnDef,
  type FilterDef,
} from '@rpg/ui'

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
import { ContentOverviewRowActions } from './content-overview-row-actions'
import {
  CAMPAIGN_AVAILABILITY_FILTER_ID,
  deriveCampaignAvailabilityScope,
  filterContentRows,
  type ContentOverviewFilterState,
} from './content-availability-table.lib'
import type { ContentBase } from './content-table-config'

const EDIT_DETAILS_LABEL = 'Edit details'

type ColumnFilterEntry = { id: string; value: unknown }
type ColumnFiltersState = ColumnFilterEntry[]

function columnFiltersToOverviewState(
  columnFilters: ColumnFiltersState,
): ContentOverviewFilterState {
  const read = (id: string) =>
    columnFilters.find((entry: ColumnFilterEntry) => entry.id === id)?.value

  return {
    name: read('name') as string | undefined,
    source: read('source') as string | undefined,
    status: read('status') as string | undefined,
    campaignAvailability:
      (read(CAMPAIGN_AVAILABILITY_FILTER_ID) as CampaignAvailabilityFilter | undefined) ??
      CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
  }
}

function setCampaignAvailabilityFilter(
  columnFilters: ColumnFiltersState,
  value: CampaignAvailabilityFilter,
): ColumnFiltersState {
  const without = columnFilters.filter((entry) => entry.id !== CAMPAIGN_AVAILABILITY_FILTER_ID)
  if (value === CAMPAIGN_AVAILABILITY_FILTER_DEFAULT) return without
  return [...without, { id: CAMPAIGN_AVAILABILITY_FILTER_ID, value }]
}

export type ContentOverviewTableProps<T extends WithCampaignAccess<ContentBase> & { id: string }> =
  {
    contentTypeKey: ContentTypeKey
    campaignId: string
    columns: ColumnDef<T, unknown>[]
    filters: FilterDef<T>[]
    data: T[]
    caption?: string
    getEditHref: (row: T) => string
  }

export function ContentOverviewTable<T extends WithCampaignAccess<ContentBase> & { id: string }>({
  contentTypeKey,
  campaignId,
  columns,
  filters,
  data,
  caption,
  getEditHref,
}: ContentOverviewTableProps<T>) {
  const tableRootRef = useRef<HTMLDivElement>(null)
  const actionTriggerRefs = useRef(new Map<string, HTMLButtonElement>())
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
    filters
      .filter(
        (filter): filter is FilterDef<T> & { defaultValue: string } =>
          filter.type === 'select' && filter.defaultValue !== undefined,
      )
      .map((filter) => ({ id: filter.id, value: filter.defaultValue })),
  )

  const filterState = useMemo(() => columnFiltersToOverviewState(columnFilters), [columnFilters])

  const scopedRows = useMemo(
    () => filterContentRows(data, filterState, { excludeCampaignAvailability: true }),
    [data, filterState],
  )

  const scope = useMemo(
    () => deriveCampaignAvailabilityScope(scopedRows, filterState),
    [filterState, scopedRows],
  )

  const visibleRows = useMemo(() => filterContentRows(data, filterState), [data, filterState])
  const pluralNoun = getContentTypeMidSentenceLabel(contentTypeKey, { plural: true })
  const itemLabel = getContentTypeMidSentenceLabel(contentTypeKey)

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

    if (filterState.campaignAvailability === 'available') {
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
              setColumnFilters((current) => setCampaignAvailabilityFilter(current, 'all'))
            }
          >
            {CAMPAIGN_ACCESS_TABLE_SHOW_ALL_LABEL}
          </Button>
        </>
      )
    }

    if (filterState.campaignAvailability === 'all') {
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
              setColumnFilters((current) => setCampaignAvailabilityFilter(current, 'available'))
            }
          >
            {CAMPAIGN_ACCESS_TABLE_HIDE_UNAVAILABLE_LABEL}
          </Button>
        </>
      )
    }

    return null
  }, [filterState.campaignAvailability, scope.unavailableCount])

  const emptyState = useCallback(() => {
    if (
      filterState.campaignAvailability === 'available' &&
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
                setColumnFilters((current) => setCampaignAvailabilityFilter(current, 'unavailable'))
              }
            >
              {CAMPAIGN_ACCESS_TABLE_SHOW_UNAVAILABLE_LABEL}
            </Button>
          </p>
        </div>
      )
    }

    return <p>No results.</p>
  }, [filterState.campaignAvailability, pluralNoun, scope.unavailableCount, scope.visibleCount])

  return (
    <div ref={tableRootRef} tabIndex={-1} className="outline-none">
      <DataTable
        columns={columns}
        data={data}
        filters={filters}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        rowActions={(row) => (
          <ContentOverviewRowActions
            campaignId={campaignId}
            contentTypeKey={contentTypeKey}
            entityId={row.id}
            editHref={getEditHref(row)}
            itemLabel={itemLabel}
            campaignAccess={row.campaignAccess}
            campaignAvailabilityFilter={filterState.campaignAvailability}
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
        filterNotice={filterNotice}
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
