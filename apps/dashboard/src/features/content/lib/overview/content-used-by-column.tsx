import type {
  ContentInformationalUsageReference,
  ContentListUsageFields,
  ContentOverviewUsageScope,
  ContentUsageSummaryLabels,
} from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'

import { buildUsedByOverviewColumn } from '@/lib/usage-references/build-used-by-overview-column'

import {
  CONTENT_OVERVIEW_USED_BY_CHARACTERS_LABEL,
  CONTENT_OVERVIEW_USED_BY_CHARACTERS_TOOLTIP,
} from '../labels'

type ContentUsageRow = ContentListUsageFields & { id: string }

/** Overview Used By column — only when API exposes batch counts + declared scope. */
export function buildContentUsedByColumn<T extends ContentUsageRow>(
  usageSummaryLabels: ContentUsageSummaryLabels,
  overviewUsageScope?: ContentOverviewUsageScope,
): ColumnDef<T> {
  const label =
    overviewUsageScope === 'characters' ? CONTENT_OVERVIEW_USED_BY_CHARACTERS_LABEL : 'Used By'
  const scopeTooltip =
    overviewUsageScope === 'characters' ? CONTENT_OVERVIEW_USED_BY_CHARACTERS_TOOLTIP : undefined

  return buildUsedByOverviewColumn<T>({
    usageSummaryLabels,
    columnLabel: label,
    scopeTooltip,
  })
}

export type { ContentInformationalUsageReference }
