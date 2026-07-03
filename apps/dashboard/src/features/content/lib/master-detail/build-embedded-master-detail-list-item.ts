import type { ContentFormCtx } from '../forms/content-form-registry'
import type { AvailabilityReason } from '@/lib/availability'
import { isContentRowActive, resolveMasterDetailRowKey } from './content-campaign-availability'
import { resolveEmbeddedRowMeta } from './resolve-embedded-row-meta'
import type { MasterDetailListItem } from '../../components/master-detail/master-detail-list-panel.client'

export interface BuildEmbeddedMasterDetailListItemParams {
  field: { id: string }
  index: number
  row: { id?: string } | undefined
  entitySource: ContentFormCtx['entitySource']
  seedRowIds?: ReadonlySet<string>
  activeById: Record<string, boolean>
  hasRowError: (index: number) => boolean
  title: string
  eyebrow?: string
  showDelete?: boolean
  extraReasons?: readonly AvailabilityReason[]
}

/** Builds a list row with derived source badges, deletable flag, and active state. */
export function buildEmbeddedMasterDetailListItem({
  field,
  index,
  row,
  entitySource,
  seedRowIds,
  activeById,
  hasRowError,
  title,
  eyebrow,
  showDelete = true,
  extraReasons = [],
}: BuildEmbeddedMasterDetailListItemParams): MasterDetailListItem {
  const rowKey = resolveMasterDetailRowKey(field.id, row)
  const meta = resolveEmbeddedRowMeta({
    row,
    entitySource,
    seedRowIds,
    activeById,
    rowKey,
    extraReasons,
  })

  return {
    id: field.id,
    title,
    ...(eyebrow !== undefined ? { eyebrow } : {}),
    badges: meta.badges,
    deletable: showDelete && meta.deletable,
    hasError: hasRowError(index),
    active: meta.active,
  }
}

export function isEmbeddedListRowActive(
  field: { id: string },
  row: { id?: string } | undefined,
  activeById: Record<string, boolean>,
): boolean {
  return isContentRowActive(activeById, resolveMasterDetailRowKey(field.id, row))
}
