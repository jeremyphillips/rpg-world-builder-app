import { InfoTooltip, SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'

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

export type BuildUsedByOverviewColumnOptions = {
  usageSummaryLabels: UsedByOverviewSummaryLabels
  columnLabel: string
  scopeTooltip?: string
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
  const { usageSummaryLabels, columnLabel, scopeTooltip } = options

  const column = buildCollectionCountColumn({
    id: 'usedBy',
    label: columnLabel,
    getItems: mapUsedBySummaryToCollectionItems,
    getCount: (row) => row.usedBy,
    singularLabel: usageSummaryLabels.singular,
    pluralLabel: usageSummaryLabels.plural,
  })

  return {
    ...column,
    header: ({ column: tableColumn }) => (
      <span className="inline-flex items-center gap-1">
        <SortableHeader column={tableColumn}>{columnLabel}</SortableHeader>
        {scopeTooltip ? (
          <InfoTooltip aria-label={`About ${columnLabel}`}>{scopeTooltip}</InfoTooltip>
        ) : null}
      </span>
    ),
    meta: {
      ...column.meta,
      label: columnLabel,
    },
  } as ColumnDef<TRow>
}
