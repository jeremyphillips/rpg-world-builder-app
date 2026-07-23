import type { ContentFormCtx } from '../forms/content-form-registry'
import type { AvailabilityReason } from '@/lib/availability'
import { resolveEmbeddedRowMeta } from './resolve-embedded-row-meta'
import type { MasterDetailListItem } from '../../components/master-detail/master-detail-list-panel.client'

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

/** Builds a list row with derived source badges and deletable flag. */
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
  const meta = resolveEmbeddedRowMeta({
    row,
    entitySource,
    seedRowIds,
    extraReasons,
  })

  return {
    id: field.id,
    title,
    ...(eyebrow !== undefined ? { eyebrow } : {}),
    badges: meta.badges,
    deletable: showDelete && meta.deletable,
    hasError: hasRowError(index),
    active: meta.availability.status === 'active',
  }
}
