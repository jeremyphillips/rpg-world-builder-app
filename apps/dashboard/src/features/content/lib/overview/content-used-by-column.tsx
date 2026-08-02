import type {
  ContentInformationalUsageReference,
  ContentListUsageFields,
  ContentOverviewUsageScope,
  ContentUsageSummaryLabels,
} from '@rpg/contracts'
import { InfoTooltip, SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'

import { buildCollectionCountColumn } from '@/lib/data-table/column-builders'

import {
  CONTENT_OVERVIEW_USED_BY_CHARACTERS_LABEL,
  CONTENT_OVERVIEW_USED_BY_CHARACTERS_TOOLTIP,
} from '../labels'

type ContentUsageRow = ContentListUsageFields & { id: string }

function mapUsedBySummaryToCollectionItems(
  entry: ContentUsageRow,
): { id: string; label: string }[] {
  return (entry.usedBySummary ?? []).map((reference: ContentInformationalUsageReference) => ({
    id: reference.id,
    label: reference.label,
  }))
}

/** Overview Used By column — only when API exposes batch counts + declared scope. */
export function buildContentUsedByColumn<T extends ContentUsageRow>(
  usageSummaryLabels: ContentUsageSummaryLabels,
  overviewUsageScope?: ContentOverviewUsageScope,
): ColumnDef<T> {
  const label =
    overviewUsageScope === 'characters' ? CONTENT_OVERVIEW_USED_BY_CHARACTERS_LABEL : 'Used By'
  const scopeTooltip =
    overviewUsageScope === 'characters' ? CONTENT_OVERVIEW_USED_BY_CHARACTERS_TOOLTIP : undefined

  const column = buildCollectionCountColumn({
    id: 'usedBy',
    label,
    getItems: mapUsedBySummaryToCollectionItems,
    getCount: (row) => row.usedBy,
    singularLabel: usageSummaryLabels.singular,
    pluralLabel: usageSummaryLabels.plural,
  })

  return {
    ...column,
    header: ({ column: tableColumn }) => (
      <span className="inline-flex items-center gap-1">
        <SortableHeader column={tableColumn}>{label}</SortableHeader>
        {scopeTooltip ? (
          <InfoTooltip aria-label={`About ${label}`}>{scopeTooltip}</InfoTooltip>
        ) : null}
      </span>
    ),
    meta: {
      ...column.meta,
      label,
    },
  } as ColumnDef<T>
}
