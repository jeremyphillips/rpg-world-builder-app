import type { ContentFormCtx } from '../forms/registry/content-form-registry'
import type { AvailabilityReason } from '@/lib/availability'
import type { MasterDetailListItem } from '../../components/master-detail/master-detail-list-panel'
import { resolveEmbeddedRowMeta } from './resolve-embedded-row-meta'

export interface BuildEmbeddedMasterDetailListItemParams {
  field: { id: string }
  index: number
  row: { id?: string } | undefined
  entitySource: ContentFormCtx['entitySource']
  seedRowIds?: ReadonlySet<string>
  getRowIssueCount: (index: number) => number
  title: string
  eyebrow?: string
  showDelete?: boolean
  extraReasons?: readonly AvailabilityReason[]
}

/** Builds a list row with structured meta and deletable flag for the detail panel. */
export function buildEmbeddedMasterDetailListItem({
  field,
  index,
  row,
  entitySource,
  seedRowIds,
  getRowIssueCount,
  title,
  eyebrow,
  showDelete = true,
  extraReasons = [],
}: BuildEmbeddedMasterDetailListItemParams): MasterDetailListItem {
  const rowMeta = resolveEmbeddedRowMeta({
    row,
    entitySource,
    seedRowIds,
    extraReasons,
  })
  const issueCount = getRowIssueCount(index)

  return {
    id: field.id,
    title,
    meta: {
      ...(eyebrow !== undefined ? { eyebrow } : {}),
      sourceLabel: rowMeta.sourceLabel,
    },
    deletable: showDelete && rowMeta.deletable,
    issueCount,
    hasError: issueCount > 0,
    active: rowMeta.availability.status === 'active',
  }
}
