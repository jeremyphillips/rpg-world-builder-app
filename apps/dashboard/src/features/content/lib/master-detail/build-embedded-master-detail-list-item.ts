import type { ContentFormCtx } from '../forms/registry/content-form-registry'
import type { AvailabilityReason } from '@/lib/availability'
import type { MasterDetailListItem } from '../../components/master-detail/master-detail-list-panel'
import { resolveMasterDetailRowKey } from './content-campaign-availability'
import { resolveEmbeddedRowMeta } from './resolve-embedded-row-meta'

export interface BuildEmbeddedMasterDetailListItemParams {
  field: { id: string }
  index: number
  row: { id?: string } | undefined
  entityCatalogLayer: ContentFormCtx['entityCatalogLayer']
  persistedRowIds?: ReadonlySet<string>
  systemOriginRowIds?: ReadonlySet<string>
  getRowIssueCount: (index: number) => number
  title: string
  eyebrow?: string
  kindLabel?: string
  summary?: string
  sectionLabel?: string
  showDelete?: boolean
  extraReasons?: readonly AvailabilityReason[]
}

/** Builds a list row. Callers supply classification. They cannot replace provenance or persistence. */
export function buildEmbeddedMasterDetailListItem({
  field,
  index,
  row,
  entityCatalogLayer,
  persistedRowIds,
  systemOriginRowIds,
  getRowIssueCount,
  title,
  eyebrow,
  kindLabel,
  summary,
  sectionLabel,
  showDelete = true,
  extraReasons = [],
}: BuildEmbeddedMasterDetailListItemParams): MasterDetailListItem {
  const rowMeta = resolveEmbeddedRowMeta({
    row,
    entityCatalogLayer,
    persistedRowIds,
    systemOriginRowIds,
    extraReasons,
  })
  const issueCount = getRowIssueCount(index)

  return {
    id: resolveMasterDetailRowKey(field.id, row),
    title,
    meta: {
      provenance: rowMeta.provenance,
      persistence: rowMeta.persistence,
      ...(eyebrow !== undefined ? { eyebrow } : {}),
      ...(kindLabel ? { kindLabel } : {}),
      ...(summary ? { summary } : {}),
      ...(sectionLabel ? { sectionLabel } : {}),
    },
    deletable: showDelete && rowMeta.deletable,
    issueCount,
    hasError: issueCount > 0,
  }
}
