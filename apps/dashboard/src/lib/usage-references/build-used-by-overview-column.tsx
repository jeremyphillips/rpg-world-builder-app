import { SortableHeader } from '@rpg/ui'
import type { ColumnDef, DataTableColumnWidth } from '@rpg/ui'

import { buildCollectionCountColumn } from '@/lib/data-table/column-builders'

export type UsedByOverviewRow = {
  id: string
  usedBy: number
  usedBySummary?: ReadonlyArray<{ id: string; label: string }>
}

export type UsedByOverviewSummaryLabels = {
  singular: string
  plural: string
}

export type UsedByOverviewColumnMeta = {
  overviewCharactersUsageScope?: true
}

export type BuildUsedByOverviewColumnOptions = {
  usageSummaryLabels: UsedByOverviewSummaryLabels
  columnLabel: string
  scopeTooltip?: string
  width?: DataTableColumnWidth
  overviewCharactersUsageScope?: true
}

function mapUsedBySummaryToCollectionItems(
  entry: UsedByOverviewRow,
): { id: string; label: string }[] {
  return (entry.usedBySummary ?? []).map((reference) => ({
    id: reference.id,
    label: reference.label,
  }))
}

/** Shared overview Used By column — content and vocabulary consumers pass scope-specific labels. */
export function buildUsedByOverviewColumn<TRow extends UsedByOverviewRow>(
  options: BuildUsedByOverviewColumnOptions,
): ColumnDef<TRow> {
  const { usageSummaryLabels, columnLabel, scopeTooltip, width, overviewCharactersUsageScope } =
    options

  const column = buildCollectionCountColumn({
    id: 'usedBy',
    label: columnLabel,
    getItems: mapUsedBySummaryToCollectionItems,
    getCount: (row) => row.usedBy,
    singularLabel: usageSummaryLabels.singular,
    pluralLabel: usageSummaryLabels.plural,
    ...(width ? { width } : {}),
  })

  return {
    ...column,
    header: ({ column: tableColumn }) => (
      <SortableHeader column={tableColumn} label={columnLabel} info={scopeTooltip}>
        {columnLabel}
      </SortableHeader>
    ),
    meta: {
      ...column.meta,
      label: columnLabel,
      ...(overviewCharactersUsageScope ? { overviewCharactersUsageScope: true } : {}),
    },
  } as ColumnDef<TRow>
}
