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
  hasRowError: (index: number) => boolean
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
  hasRowError,
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

  return {
    id: field.id,
    title,
    meta: {
      ...(eyebrow !== undefined ? { eyebrow } : {}),
      sourceLabel: rowMeta.sourceLabel,
    },
    deletable: showDelete && rowMeta.deletable,
    hasError: hasRowError(index),
    active: rowMeta.availability.status === 'active',
  }
}
